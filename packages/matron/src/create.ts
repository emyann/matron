import chalk from 'chalk';
import spawn from 'cross-spawn';
import path from 'path';
import { Bundler, TestFramework } from './typings';
import { CommandModule } from 'yargs';
import { SpawnSyncOptions } from 'child_process';
import { existsSync } from 'fs';
import { strings, normalize } from '@angular-devkit/core';
import { UnsuccessfulWorkflowExecution } from '@angular-devkit/schematics';
import { RunnerFactory } from './RunnerFactory';

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

  try {
    const runner = RunnerFactory({ dryRun });
    await runner
      .execute({
        collection: SCHEMATICS_MODULE,
        schematic: 'create',
        options: {
          name: projectName ? projectName : name,
          projectPath: normalizedName,
          dryRun
        }
      })
      .toPromise();

    if (!(dryRun || skipInstall)) {
      npmInstall(projectPath);
    }
    printFinalMessage(projectPath);

    return 0;
  } catch (err) {
    if (err instanceof UnsuccessfulWorkflowExecution) {
      console.error('The Schematic workflow failed. See above.');
      // "See above" because we already printed the error.
      // logger.fatal('The Schematic workflow failed. See above.');
    } else {
      // logger.fatal(err.stack || err.message);
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
