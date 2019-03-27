import spawn from 'cross-spawn';
import { SpawnSyncOptions } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';
import path from 'path';

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
export function executeTask(task: Task, options: SpawnSyncOptions = { stdio: 'inherit' }) {
  const { stdio } = options;
  let { cwd } = options;
  if (!cwd) {
    cwd = path.resolve(process.cwd());
  }
  return spawn.sync(task.command, task.args, { stdio, cwd });
}

export function displayH1(text: TemplateStringsArray) {
  return chalk
    .bgHex('#abedd8')
    .hex('#173d4e')
    .bold(text);
}
