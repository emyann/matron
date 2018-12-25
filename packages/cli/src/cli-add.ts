import * as program from 'commander';
import chalk from 'chalk';
import * as spawn from 'cross-spawn';
import * as path from 'path';

// alias, flag, description, default value
program.arguments('<recipe>').action((recipe: string) => {
  add(recipe);
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

function add(recipe: string) {
  console.log('running add command');
  const path =  './temp/twkj'
  executeTask({ command: 'npm', args: ['install', '--save-dev', 'jest'] }, path);
  executeTask({ command: 'npx', args: ['jest', '--init'] }, path);

}

interface Task {
  command: string;
  args?: string[];
}

function executeTask(task: Task, directoryPath?:string) {
  if(!directoryPath){
    directoryPath = path.resolve(process.cwd());
  }
  spawn.sync(task.command, task.args, { stdio: 'inherit',  cwd: directoryPath });
}
