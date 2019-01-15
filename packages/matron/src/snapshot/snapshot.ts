import spawn from 'cross-spawn';
import path from 'path';
import { CommandModule } from 'yargs';
import { Runner } from '../RunnerFactory';

export const snapshot: CommandModule<SnapshotOptions, SnapshotOptions> = {
  command: 'snapshot [path]',
  describe: 'Take a snapshot of your file system and create a template',
  builder: {},
  handler: options => snapshotCommand(options)
};

interface SnapshotOptions {
  path: string;
  dryRun: boolean;
}
async function snapshotCommand(options: SnapshotOptions) {
  const { path = './', dryRun } = options;
  const runner = new Runner({ dryRun });
  runner.snapshot({ path });
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
