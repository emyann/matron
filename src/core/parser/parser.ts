import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { morphism, createSchema } from 'morphism';

export interface Command {
  cmd: keyof typeof CommandType;
  args: string[];
}

export enum CommandType {
  COPY = 'COPY',
  RUN = 'RUN',
  WORKDIR = 'WORKDIR',
  MERGE_JSON = 'MERGE_JSON'
}

export function loadFile(path: string) {
  return Promise.resolve(readFileSync(path, 'utf8'));
}

export interface Job {
  key: string;
  name?: string;
  steps: Command[];
}

type YamlDocStep = { [key: string]: string };
interface YamlDoc {
  jobs: { [key: string]: { name?: string; steps: YamlDocStep[] } };
}

const toCommand = morphism(
  createSchema<Command, YamlDocStep>({
    cmd: step => {
      return Object.keys(step)[0] as CommandType;
    },
    args: step => Object.values(step)[0].split(' ')
  })
);
export function parser(content: string): Job[] {
  try {
    const doc: YamlDoc = yaml.safeLoad(content);
    return Object.entries(doc.jobs).map(([key, job]) => {
      return {
        key,
        name: job.name,
        steps: toCommand(job.steps)
      };
    });
  } catch (error) {
    throw error;
  }
}

function getCommandParameters(commandString: string) {
  const regex = /\${(?<param>\w+)}/gm;
  const parameters: string[] = [];
  let matches;
  while ((matches = regex.exec(commandString)) !== null) {
    if (matches.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    if (matches.groups && matches.groups.param) parameters.push(matches.groups.param);
  }

  return parameters;
}

export function evaluate(command: Command): Command {
  const commandString = command.args.join(' ');
  const params = getCommandParameters(commandString);
  const evaluatedCommandString = params.reduce((acc, param) => {
    const value = process.env[param];
    if (value === undefined) throw new Error(`Parameter ${param} is not defined.`);
    return acc.replace(`\${${param}}`, value);
  }, commandString);
  return {
    cmd: command.cmd,
    args: evaluatedCommandString.split(' ')
  };
}

interface SpawnCommand {
  cmd: string;
  args: string[];
}

export function toSpawnCommand(command: Command): SpawnCommand {
  return {
    cmd: command.args[0],
    args: command.args.slice(1)
  };
}
