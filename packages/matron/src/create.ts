import chalk from 'chalk';
import spawn from 'cross-spawn';
import path from 'path';
import { Bundler, TestFramework } from './typings';
import { CommandModule } from 'yargs';

interface CreateOptions {
  name: string;
  bundler?: Bundler;
  test?: TestFramework;
  template?: string;
  skipInstall?: boolean;
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
    }
  },
  handler: args => {
    const options = {
      name: args.name,
      type: args.type,
      bundler: args.bundler,
      test: args.test,
      template: args.template,
      skipInstall: args.skipInstall
    };

    create(options);
  }
};

function create(options: CreateOptions) {
  const SCHEMATICS_MODULE = '@matron/schematics';
  const { name } = options;
  const { bundler, template, test } = options;
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

  if (template && (bundler || test)) {
    console.warn(
      'You have specified a template along with a bundler, test or type option. Only the template flag will be used'
    );
    console.log(bundler, test);
    const command = 'schematics';
    const args = [`${SCHEMATICS_MODULE}:create`, '--name', name, '--template', template, '--provider', 'local'];
    spawn.sync(command, args, { stdio: 'inherit' });
    // console.log(template, res);
  } else {
    // Only Typscript is supported atm
    const templateName = generateTemplateName(options);
    const command = 'schematics';
    const args = [`${SCHEMATICS_MODULE}:create`, '--name', name, '--template', templateName, '--provider', 'local'];

    spawn.sync(command, args, { stdio: 'inherit' });
  }
  //TODO: exit when schematics issues an error
  const projectPath = path.resolve(process.cwd(), name);
  if (!options.skipInstall) {
    npmInstall(projectPath);
  }
  printFinalMessage(projectPath);
}

function npmInstall(path: string) {
  const command = 'npm';
  const args = ['install', '--save', '--save-exact', '--loglevel', 'error'];

  console.log('installing NPM dependencies');
  spawn.sync(command, args, { stdio: 'inherit', cwd: path });
}

function printFinalMessage(projetPath: string) {
  console.log(`Project successfully created at ${chalk.green(projetPath)}`);
  console.log(`Try ${chalk.yellow('npm start')} in the project folder`);
}
function generateTemplateName({ bundler, test }: CreateOptions) {
  let templateName = 'typescript';
  if (bundler) templateName = templateName + `-${bundler}`;
  if (test) templateName = templateName + `-${test}`;
  return templateName;
}
