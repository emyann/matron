import spawn from 'cross-spawn';
import path from 'path';
import { CommandModule } from 'yargs';
import { Runner } from './RunnerFactory';
import { UnsuccessfulWorkflowExecution } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';

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
    },
    'dry-run': {
      alias: 'd',
      describe: 'Dry run',
      boolean: true
    }
  },
  handler: args => {
    const options = {
      recipe: args.recipe,
      path: args.path,
      skipInstall: args.skipInstall,
      dryRun: args.dryRun ? true : false
    };
    add(options);
  }
};

interface AddOptions {
  recipe: string;
  path: string;
  skipInstall: boolean;
  dryRun?: boolean;
}
async function add(options: AddOptions) {
  const { path: executionPath, recipe, dryRun } = options;
  console.log(`Add ${recipe}`);

  const normalizedName = normalize(process.cwd());
  const projectName = normalizedName.split(path.sep).pop() as string;
  // const projectPath = path.join(process.cwd(), normalizedName);

  try {
    const runner = new Runner({ dryRun, path: executionPath });
    await runner.add({ projectName, projectPath: './', recipe });
  } catch (err) {
    if (err instanceof UnsuccessfulWorkflowExecution) {
      console.error('The Schematic workflow failed. See above.');
      // "See above" because we already printed the error.
      // logger.fatal('The Schematic workflow failed. See above.');
    } else {
      // logger.fatal(err.stack || err.message);
    }
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
