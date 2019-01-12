import chalk from 'chalk';
import path from 'path';
import { Bundler, TestFramework } from './typings';
import { CommandModule } from 'yargs';
import { strings, normalize } from '@angular-devkit/core';
import { UnsuccessfulWorkflowExecution } from '@angular-devkit/schematics';
import { Runner } from './RunnerFactory';
import { npmInstall, printFinalMessage } from './helpers';

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
    const runner = new Runner({ dryRun });
    await runner.create({
      name: projectName ? projectName : name,
      projectPath: normalizedName,
      dryRun
    });
    // .execute({
    //   collection: SCHEMATICS_MODULE,
    //   schematic: 'create',
    //   options: {
    //     name: projectName ? projectName : name,
    //     projectPath: normalizedName,
    //     dryRun
    //   }
    // })
    // .toPromise();

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
