import { createConsoleLogger, NodeJsSyncHost } from '@angular-devkit/core/node';
import { virtualFs, normalize, Path } from '@angular-devkit/core';
import { NodeWorkflow } from '@angular-devkit/schematics/tools';
import { DryRunEvent } from '@angular-devkit/schematics';
import chalk from 'chalk';
import { SCHEMATICS_MODULE } from './constants';
import { AddSchema, CreateSchema, SnapshotSchema, Schematics } from '@matron/schematics';

interface RunnerOptions {
  dryRun?: boolean;
  path?: string;
}

function WorkflowFactory(options: RunnerOptions) {
  const { dryRun, path } = options;

  const logger = createConsoleLogger(true, process.stdout, process.stderr);
  const fsHost = new virtualFs.ScopedHost(new NodeJsSyncHost());

  /** Create the workflow that will be executed with this run. */
  let loggingQueue: string[] = [];
  let error = false;
  let workflow;
  if (path) {
    workflow = new NodeWorkflow(fsHost, { dryRun, root: normalize(path) });
  } else {
    workflow = new NodeWorkflow(fsHost, { dryRun });
  }
  workflow.reporter.subscribe((event: DryRunEvent) => {
    switch (event.kind) {
      case 'error':
        error = true;

        const desc = event.description == 'alreadyExist' ? 'already exists' : 'does not exist';
        logger.warn(`ERROR! ${event.path} ${desc}.`);
        break;
      case 'update':
        loggingQueue.push(`${chalk.white('UPDATE')} ${event.path} (${event.content.length} bytes)`);
        break;
      case 'create':
        loggingQueue.push(`${chalk.green('CREATE')} ${event.path} (${event.content.length} bytes)`);
        break;
      case 'delete':
        loggingQueue.push(`${chalk.yellow('DELETE')} ${event.path}`);
        break;
      case 'rename':
        loggingQueue.push(`${chalk.blue('RENAME')} ${event.path} => ${event.to}`);
        break;
    }
  });
  workflow.lifeCycle.subscribe((event: any) => {
    if (event.kind == 'workflow-end' || event.kind == 'post-tasks-start') {
      if (!error) {
        // Flush the log queue and clean the error state.
        loggingQueue.forEach(log => logger.info(log));
      }
      loggingQueue = [];
      error = false;
    }
  });

  return workflow;
}

export class Runner {
  workflow: NodeWorkflow;
  constructor(options: RunnerOptions) {
    this.workflow = WorkflowFactory(options);
  }
  async create(options: CreateSchema) {
    return this.execute('create', options);
  }
  async add(options: AddSchema) {
    return this.execute('add', options);
  }
  async snapshot(options: SnapshotSchema) {
    return this.execute('snapshot', options);
  }

  private execute(command: Schematics, options: any) {
    return this.workflow
      .execute({
        collection: SCHEMATICS_MODULE,
        schematic: command,
        options
      })
      .toPromise();
  }
}
