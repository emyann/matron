import { CommandModule } from 'yargs';
import { Runner } from '../RunnerFactory';
import { SnapshotSchema } from '@matron/schematics';
import path from 'path';

export const snapshot: CommandModule<SnapshotOptions, SnapshotOptions> = {
  command: 'snapshot [path] [destination]',
  describe: 'Take a snapshot of your file system and create a template',
  builder: {
    path: {
      alias: 'p',
      describe: 'Directory to snapshot',
      type: 'string'
    },
    ignore: {
      alias: 'i',
      describe: 'Ignore files',
      type: 'array'
    },
    'dry-run': {
      alias: 'd',
      describe: 'Dry run',
      boolean: true
    }
  },
  handler: args => {
    const options = { ...args, path: args.path ? path.resolve(args.path) : path.resolve(process.cwd()) };
    snapshotCommand(options);
  }
};

type SnapshotOptions = SnapshotSchema & CommonOptions;
interface CommonOptions {
  dryRun?: boolean;
}
export async function snapshotCommand(options: SnapshotOptions) {
  const { path: pathToSnapshot, dryRun, destination, ignore } = options;
  const runner = new Runner({ dryRun: !!dryRun });
  return runner.snapshot({ path: pathToSnapshot, destination, ignore });
}
