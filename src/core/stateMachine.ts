import { interpret, createMachine, assign, actions } from 'xstate';
import { createAction } from '@reduxjs/toolkit';
import { Command, CommandType, parser, loadFile, evaluate, toSpawnCommand } from './parser/parser';
import spawn from 'cross-spawn';
import uuidv4 from 'uuid/v4';
import merge from 'deepmerge';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';

const { log } = actions;

enum ActionType {
  SET_WORKDIR = 'SET_WORKDIR',
  START_PARSE = 'START_PARSE',
  START_EXECUTE = 'START_EXECUTE',
  EXECUTE_COMMAND = 'EXECUTE_COMMAND',
  EXECUTE_JOB = 'EXECUTE_JOB',
  EXECUTE_COMMANDS = 'EXECUTE_COMMANDS'
  // LOG= 'LOG'
}

export const setWorkdir = createAction<{ path: string }, ActionType.SET_WORKDIR>(ActionType.SET_WORKDIR);
export const startParse = createAction<{ matronFilePath: string }, ActionType.START_PARSE>(ActionType.START_PARSE);
export const startExecute = createAction<{ commands: Command[] }, ActionType.START_EXECUTE>(ActionType.START_EXECUTE);
export const executeCommand = createAction<{ commandItem: CommandItem }, ActionType.EXECUTE_COMMAND>(ActionType.EXECUTE_COMMAND);
export const executeJob = createAction<{ jobItem: JobItem }, ActionType.EXECUTE_JOB>(ActionType.EXECUTE_JOB);
// export const log = createAction<{ message: string }, ActionType.LOG>(ActionType.LOG);

// export const executeCommands = createAction<undefined, ActionType.EXECUTE_COMMANDS>(ActionType.EXECUTE_COMMANDS);

type MatronActions =
  | ReturnType<typeof setWorkdir>
  | ReturnType<typeof startParse>
  | ReturnType<typeof startExecute>
  | ReturnType<typeof executeCommand>
  // | ReturnType<typeof executeCommands>
  | ReturnType<typeof executeJob>;

interface MatronOptions {
  executionPath?: string;
}

interface CommandItem {
  id: string;
  executed: boolean;
  rawCommand: Command;
  evaluatedCommand: Command;
}

export interface NormalizedState<T> {
  byId: Record<string, T>;
  allIds: string[];
}

interface JobItem {
  id: string;
  key: string;
  name?: string;
  commands: string[];
  executed: boolean;
}

interface MatronContext {
  config: {
    executionPath: string;
    matronFile: {
      path: string;
      text: string;
    };
  };
  jobs: NormalizedState<JobItem>;
  commands: NormalizedState<CommandItem>;
}

export function getStateMachineInterpreter(options: MatronOptions) {
  const defaultOptions = {
    executionPath: './'
  };
  Object.assign(defaultOptions, options);
  const matronMachine = createMachine<MatronContext, MatronActions>({
    id: 'matron',
    strict: true,
    initial: 'idle',
    context: {
      config: {
        ...defaultOptions,
        matronFile: { path: '', text: '' }
      },
      jobs: { byId: {}, allIds: [] },
      commands: { byId: {}, allIds: [] }
    },

    states: {
      idle: {
        on: {
          START_PARSE: {
            target: 'parse',
            actions: assign({
              config: (context, event) => {
                return {
                  ...context.config,
                  matronFile: {
                    ...context.config.matronFile,
                    path: event.payload.matronFilePath
                  }
                };
              }
            })
          }
        }
      },
      parse: {
        initial: 'loadingMatronFile',
        entry: log(() => 'Parsing Matron file'),
        states: {
          loadingMatronFile: {
            invoke: {
              id: 'loadingMatronFile',
              src: context => loadFile(context.config.matronFile.path),
              onDone: {
                target: 'extractJobs',
                actions: assign({
                  config: (context, event) => {
                    return {
                      ...context.config,
                      matronFile: {
                        ...context.config.matronFile,
                        text: event.data
                      }
                    };
                  }
                })
              }
            }
          },
          extractJobs: {
            invoke: {
              id: 'extractJobs',
              src: context => {
                const matronFileText = context.config.matronFile.text;

                const jobs = parser(matronFileText);
                const commandItemsByJobId: Record<string, CommandItem[]> = {};
                try {
                  const jobItems = jobs.map<JobItem>(job => {
                    const jobId = uuidv4();
                    commandItemsByJobId[jobId] = job.steps.map(step => {
                      return { id: uuidv4(), rawCommand: step, evaluatedCommand: evaluate(step), executed: false };
                    });
                    return {
                      id: jobId,
                      key: job.key,
                      name: job.name,
                      commands: commandItemsByJobId[jobId].map(commandItem => commandItem.id),
                      executed: false
                    };
                  });
                  return Promise.resolve({ jobItems, commandItemsByJobId });
                } catch (error) {
                  return Promise.reject(error);
                }
              },
              onDone: {
                target: '#matron.execute',
                actions: assign({
                  jobs: (context, event) => {
                    const { jobItems }: { jobItems: JobItem[]; commandItemsByJobId: Record<string, CommandItem[]> } = event.data;
                    return {
                      byId: {
                        ...context.jobs.byId,
                        ...jobItems.reduce<MatronContext['jobs']['byId']>((acc, jobItem) => {
                          acc[jobItem.id] = jobItem;
                          return acc;
                        }, {})
                      },
                      allIds: [...context.jobs.allIds, ...jobItems.map(jobItem => jobItem.id)]
                    };
                  },
                  commands: (context, event) => {
                    const { commandItemsByJobId }: { jobItems: JobItem[]; commandItemsByJobId: Record<string, CommandItem[]> } = event.data;
                    const allCommandsItems = Object.values(commandItemsByJobId).reduce<CommandItem[]>((acc, commandItems) => {
                      acc.push(...commandItems);
                      return acc;
                    }, []);
                    return {
                      byId: {
                        ...context.commands.byId,
                        ...allCommandsItems.reduce<MatronContext['commands']['byId']>((acc, commandItem) => {
                          acc[commandItem.id] = commandItem;
                          return acc;
                        }, {})
                      },
                      allIds: [...context.commands.allIds, ...allCommandsItems.map(commandItem => commandItem.id)]
                    };
                  }
                })
              }
            }
          }
        }
      },
      execute: {
        entry: [log(() => 'Executing Jobs')],
        on: {
          EXECUTE_JOB: {
            actions: [
              log((context, event) => {
                const {
                  payload: { jobItem }
                } = event;
                const message = jobItem.name ? jobItem.name : `Running Job ${jobItem.key}`;
                return message;
              }),
              (context, event) => {
                const {
                  payload: { jobItem }
                } = event;

                const commandItems = jobItem.commands.map(commandId => context.commands.byId[commandId]);
                commandItems.forEach(commandItem => {
                  switch (commandItem.evaluatedCommand.cmd) {
                    case CommandType.RUN:
                      {
                        const spawnCommand = toSpawnCommand(commandItem.evaluatedCommand);
                        spawn.sync(spawnCommand.cmd, spawnCommand.args, {
                          stdio: 'inherit',
                          cwd: context.config.executionPath
                        });
                      }
                      break;
                    case CommandType.WORKDIR:
                      {
                        context.config.executionPath = commandItem.evaluatedCommand.args[0];
                      }
                      break;
                    case CommandType.MERGE_JSON:
                      {
                        const sourcePath = path.join(path.dirname(context.config.matronFile.path), commandItem.evaluatedCommand.args[0]);

                        const destinationPath = path.join(
                          process.cwd(),
                          context.config.executionPath,
                          commandItem.evaluatedCommand.args[1]
                        );
                        const jsonSource = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
                        const jsonDest = JSON.parse(fs.readFileSync(destinationPath, 'utf8'));
                        const mergedJson = merge(jsonSource, jsonDest);
                        fs.writeFileSync(destinationPath, JSON.stringify(mergedJson, null, 2));
                      }
                      break;
                    case CommandType.COPY:
                      {
                        const sourcePath = path.join(path.dirname(context.config.matronFile.path), commandItem.evaluatedCommand.args[0]);
                        const destinationPath = path.join(
                          process.cwd(),
                          context.config.executionPath,
                          commandItem.evaluatedCommand.args[1]
                        );
                        fse.copySync(sourcePath, destinationPath);
                      }
                      break;
                    default:
                      break;
                  }
                });
              },
              assign({
                jobs: (context, event) => {
                  const {
                    payload: { jobItem }
                  } = event;
                  return {
                    byId: {
                      ...context.jobs.byId,
                      [jobItem.id]: {
                        ...context.jobs.byId[jobItem.id],
                        executed: true
                      }
                    },
                    allIds: context.jobs.allIds
                  };
                },
                commands: (context, event) => {
                  const {
                    payload: { jobItem }
                  } = event;
                  const commandItems = jobItem.commands.map(commandId => context.commands.byId[commandId]);
                  return {
                    byId: {
                      ...context.commands.byId,
                      ...commandItems.reduce<Record<string, CommandItem>>((acc, commandItem) => {
                        acc[commandItem.id] = {
                          ...commandItem,
                          executed: true
                        };
                        return acc;
                      }, {})
                    },
                    allIds: context.commands.allIds
                  };
                }
              })
            ]
          }
        }
      },
      final: {}
    },
    on: {
      SET_WORKDIR: {
        actions: assign({
          config: (context, event) => {
            return {
              ...context.config,
              executionPath: event.payload.path
            };
          }
        })
      }
    }
  });

  const matronService = interpret(matronMachine);
  return matronService.start();
}
