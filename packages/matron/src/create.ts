import chalk from 'chalk';
import spawn from 'cross-spawn';
import path from 'path';
import { Bundler, TestFramework } from './typings';
import { CommandModule } from 'yargs';
import { SpawnSyncOptions } from 'child_process';
import { existsSync } from 'fs';
import { strings, normalize, virtualFs } from '@angular-devkit/core';
import { NodeJsSyncHost, createConsoleLogger } from '@angular-devkit/core/node';
import { NodeWorkflow } from '@angular-devkit/schematics/tools';
import { DryRunEvent, UnsuccessfulWorkflowExecution } from '@angular-devkit/schematics';

interface CreateOptions {
  name: string;
  bundler?: Bundler;
  test?: TestFramework;
  template?: string;
  skipInstall?: boolean;
  dryRun?: boolean;
}

export const createCommand: CommandModule<CreateOptions, CreateOptions> = {
  command: 'create <name>',
  describe: 'Start a Typescript Project',
  builder: {
    bundler: {
      alias: 'b',
      describe: 'Set a project bundler',
      type: 'string',
      choices: [Bundler.Parcel, Bundler.Webpack]
    },
    test: {
      alias: 't',
      describe: 'Set a test framework',
      type: 'string',
      choices: [TestFramework.Jest, TestFramework.KarmaJasmine]
    },
    template: {
      alias: 'p',
      describe: 'Set a template',
      type: 'string'
    },
    'skip-install': {
      alias: 's',
      describe: 'Skip npm dependencies installation',
      type: 'boolean',
      boolean: true
    },
    'dry-run': {
      alias: 'd',
      describe: 'Dry run',
      boolean: true
    }
  },
  handler: async args => {
    const options = {
      name: args.name,
      type: args.type,
      bundler: args.bundler,
      test: args.test,
      template: args.template,
      skipInstall: args.skipInstall ? true : false,
      dryRun: args.dryRun ? true : false
    };

    await create(options);
  }
};

async function create(options: CreateOptions) {
  const SCHEMATICS_MODULE = '@matron/schematics';
  const { name } = options;
  const { dryRun, skipInstall } = options;

  if (!name) {
    console.error('Please specify the project directory:');
    console.log(`  ${chalk.cyan('matron')} ${chalk.green('<project-name>')}`);
    console.log();
    console.log('For example:');
    console.log(`  ${chalk.cyan('matron')} ${chalk.green('my-typescript-lib')}`);
    console.log();
    console.log(`Run ${chalk.cyan(`${'matron'} --help`)} to see all options.`);
    process.exit(1);
  }

  const normalizedName = normalize('/' + strings.dasherize(name));
  const projectName = normalizedName.split(path.sep).pop();
  const projectPath = path.join(process.cwd(), normalizedName);

  const logger = createConsoleLogger(true, process.stdout, process.stderr);
  /** Create a Virtual FS Host scoped to where the process is being run. **/
  const fsHost = new virtualFs.ScopedHost(new NodeJsSyncHost(), normalize(process.cwd()));

  /** Create the workflow that will be executed with this run. */
  let loggingQueue: string[] = [];
  let nothingDone = true;
  let error = false;
  const workflow = new NodeWorkflow(fsHost, { dryRun });
  workflow.reporter.subscribe((event: DryRunEvent) => {
    nothingDone = false;

    switch (event.kind) {
      case 'error':
        error = true;

        const desc = event.description == 'alreadyExist' ? 'already exists' : 'does not exist';
        logger.warn(`ERROR! ${event.path} ${desc}.`);
        break;
      case 'update':
        loggingQueue.push(`
        ${chalk.white('UPDATE')} ${event.path} (${event.content.length} bytes)
      `);
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
  workflow.lifeCycle.subscribe(event => {
    if (event.kind == 'workflow-end' || event.kind == 'post-tasks-start') {
      if (!error) {
        // Flush the log queue and clean the error state.
        loggingQueue.forEach(log => logger.info(log));
      }
      loggingQueue = [];
      error = false;
    }
  });

  try {
    await workflow
      .execute({
        collection: SCHEMATICS_MODULE,
        schematic: 'create',
        options: {
          name: projectName ? projectName : name,
          projectPath: normalizedName,
          dryRun
        },
        // allowPrivate: allowPrivate,
        debug: true,
        logger: logger
      })
      .toPromise();

    if (nothingDone) {
      logger.info('Nothing to be done.');
    }

    if (!(dryRun || skipInstall)) {
      npmInstall(projectPath);
    }
    printFinalMessage(projectPath);

    return 0;
  } catch (err) {
    if (err instanceof UnsuccessfulWorkflowExecution) {
      // "See above" because we already printed the error.
      logger.fatal('The Schematic workflow failed. See above.');
    } else {
      logger.fatal(err.stack || err.message);
    }

    return 1;
  }
}

function npmInstall(path: string) {
  const command = 'npm';
  const args = ['install', '--save', '--save-exact', '--loglevel', 'error'];

  console.log('installing NPM dependencies in ', path);
  spawn.sync(command, args, { stdio: 'inherit', cwd: path });
}

function printFinalMessage(projetPath: string) {
  if (existsSync(projetPath)) {
    console.log(`Project successfully created at ${chalk.green(projetPath)}`);
    console.log(`Try ${chalk.yellow('npm start')} in the project folder`);
  }
}

// function generateTemplateName({ bundler, test }: CreateOptions) {
//   let templateName = 'typescript';
//   if (bundler) templateName = templateName + `-${bundler}`;
//   if (test) templateName = templateName + `-${test}`;
//   return templateName;
// }

function executeCmd(name: string, args?: string[], options?: SpawnSyncOptions) {
  return executeTask({ command: name, args }, options);
}

interface Task {
  command: string;
  args?: string[];
}
export function executeTask(task: Task, options?: SpawnSyncOptions) {
  const defaultOptions: SpawnSyncOptions = {
    stdio: 'inherit'
  };
  const finalOptions = { ...defaultOptions, ...options };
  return spawn.sync(task.command, task.args, finalOptions);
}
