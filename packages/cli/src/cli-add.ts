import * as program from 'commander';
import chalk from 'chalk';
import * as spawn from 'cross-spawn';
import * as path from 'path';
import { TestFramework } from './typings';

// alias, flag, description, default value
program
  .option('-p, --path [directory]')
  .arguments('<recipe>')
  .action((recipe: string) => {
    const options = {
      recipe,
      path: program.path
    };
    add(options);
  });

program.on('--help', function() {
  console.log(
    `
Examples
  ${program.name()} add ${chalk.green('webpack')}
`
  );
});

program.parse(process.argv);

interface AddOptions {
  recipe: string;
  path: string;
}
function add(options: AddOptions) {
  const { path, recipe } = options;
  console.log(`Add ${recipe}`);

  const task = { command: 'schematics', args: ['@matron/schematics:add', '--recipe', recipe] };
  console.log('executing task', task, path);
  executeTask(task, path);
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
