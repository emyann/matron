import { CommandModule } from 'yargs';
import { Runner } from '../RunnerFactory';

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
  handler: options => snapshotCommand(options)
};

interface SnapshotOptions {
  path?: string;
  destination?: string;
  dryRun?: boolean;
  ignore: string[];
}
async function snapshotCommand(options: SnapshotOptions) {
  const { path = './', dryRun, destination, ignore } = options;
  const runner = new Runner({ dryRun: !!dryRun });
  runner.snapshot({ path, destination, ignore });
}
