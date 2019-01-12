import spawn from 'cross-spawn';
import { SpawnSyncOptions } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';

export function npmInstall(path: string) {
  const command = 'npm';
  const args = ['install', '--save', '--save-exact', '--loglevel', 'error'];

  console.log('installing NPM dependencies in ', path);
  spawn.sync(command, args, { stdio: 'inherit', cwd: path });
}

export function printFinalMessage(projetPath: string) {
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
