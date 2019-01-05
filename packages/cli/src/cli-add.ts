import * as program from 'commander';
import chalk from 'chalk';
import * as spawn from 'cross-spawn';
import * as path from 'path';
import { TestFramework } from './typings';
import { CommandModule } from 'yargs';

export const addCommand: CommandModule<AddOptions, AddOptions> = {
  command: 'add <recipe>',
  describe: 'Runs a recipe against the current project',
  builder: {
    path: {
      alias: 'p',
      describe: 'Path where to run the command',
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
    console.log('args', args);
    const options = {
      recipe: args.recipe,
      path: args.path,
      skipInstall: args.skipInstall
    };
    add(options);
  }
};

// alias, flag, description, default value
// program
//   .option('-p, --path [directory]')
//   .option('-s, --skipInstall', `Skill npm depencies installation`, false)
//   .arguments('<recipe>')
//   .action((recipe: string) => {
//     const options = {
//       recipe,
//       path: program.path,
//       skipInstall: program.skipInstall
//     };
//     add(options);
//   });

// program.on('--help', function() {
//   console.log(
//     `
// Examples
//   ${program.name()} add ${chalk.green('webpack')}
// `
//   );
// });

// program.parse(process.argv);

interface AddOptions {
  recipe: string;
  path: string;
  skipInstall: boolean;
}
function add(options: AddOptions) {
  const { path, recipe } = options;
  console.log(`Add ${recipe}`);

  const task = { command: 'schematics', args: ['@matron/schematics:add', '--recipe', recipe] };
  console.log('executing task', task, path);
  executeTask(task, path);
  if (!options.skipInstall) {
    executeTask({ command: 'npm', args: ['install', '--loglevel', 'error'] }, path);
  }
}

interface Task {
  command: string;
  args?: string[];
}

export function executeTask(task: Task, directoryPath?: string) {
  if (!directoryPath) {
    directoryPath = path.resolve(process.cwd());
  }
  spawn.sync(task.command, task.args, { stdio: 'inherit', cwd: directoryPath });
}
