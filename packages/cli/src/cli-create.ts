import { parse, arguments, action, option, name } from 'commander';
import * as program from 'commander';
import chalk from 'chalk';
import * as spawn from 'cross-spawn';
import * as path from 'path';
import { ApplicationType, Bundler, TestFramework } from './typings';

interface CreateOptions {
  type?: ApplicationType;
  bundler?: Bundler;
  test?: TestFramework;
  template?: string;
  skipInstall?: boolean;
}

// alias, flag, description, default value
program
  .option('-a, --type [name]', `typescript`, 'typescript')
  .option('-b, --bundler [name]', `webpack, parcel`)
  .option('-t, --test [name]', `karma-jasmine, jest`)
  .option('-p, --template [name]', `typescript_webpack_jest, typescript_parcel_jest...`)
  .option('-s, --skipInstall', `Skill npm depencies installation`, false)
  .arguments('<project-name>')
  .action((name: string) => {
    const options = {
      type: program.type,
      bundler: program.bundler,
      test: program.test,
      template: program.template,
      skipInstall: program.skipInstall
    };
    create(name, options);
  });

program.on('--help', function() {
  console.log(
    `
Examples
  ${chalk.bgYellow(chalk.black('Using flags'))} 
    ${program.name()} create --type ${chalk.green('typescript')} --bundler ${chalk.yellow(
      'webpack'
    )} --test ${chalk.magenta('jest')} 
  
  ${chalk.bgYellow(chalk.black('Using a naming convention'))} 
    ${program.name()} create --template ${chalk.green('[TYPE]')}-${chalk.yellow('[BUNDLER]')}-${chalk.magenta(
      '[TESTFRAMEWORK]'
    )}
    ${program.name()} create --template ${chalk.green('typescript')}-${chalk.yellow('parcel')}-${chalk.magenta(
      'karma-jasmine'
    )}
`
  );
});

program.parse(process.argv);

function create(name: string, options: CreateOptions) {
  const SCHEMATICS_MODULE = '@matron/schematics';

  const { bundler, template, test, type } = options;
  if (!name) {
    console.error('Please specify the project directory:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-name>')}`);
    console.log();
    console.log('For example:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-typescript-lib')}`);
    console.log();
    console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
    process.exit(1);
  }

  if (template && (bundler || test || type)) {
    console.warn(
      'You have specified a template along with a bundler, test or type option. Only the template flag will be used'
    );
    console.log(bundler, test, type);
    const command = 'schematics';
    const args = [`${SCHEMATICS_MODULE}:create`, '--name', name, '--template', template, '--provider', 'local'];
    spawn.sync(command, args, { stdio: 'inherit' });
    // console.log(template, res);
  } else if (type) {
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
function generateTemplateName({ type, bundler, test }: CreateOptions) {
  let templateName = '';
  if (type) templateName = templateName + type;
  if (bundler) templateName = templateName + `-${bundler}`;
  if (test) templateName = templateName + `-${test}`;
  return templateName;
}
