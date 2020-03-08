import { getStateMachineInterpreter, startParse, executeJob } from './stateMachine';
import dotenv from 'dotenv-flow';
import path from 'path';
import { ArgsConflictError, RequiredArgsError, MatronFileMissingError, GenericError } from '../cli/utilities/errors';
import fse from 'fs-extra';

interface RunnerOptions {
  matronFileRelativePath?: string;
  dotEnvFolderRelativePath?: string;
  templateFolderRelativePath?: string;
}
export function run(options: RunnerOptions) {
  const { matronFileRelativePath, dotEnvFolderRelativePath, templateFolderRelativePath } = options;
  let matronFileAbsolutePath: string | undefined;

  if (validateRequiredArgs({ matronFileRelativePath, templateFolderRelativePath })) {
    if (templateFolderRelativePath) {
      const templateFolderAbsolutePath = getAbsolutePath(templateFolderRelativePath);

      if (!fse.existsSync(path.join(templateFolderAbsolutePath, './matron.yml'))) {
        throw new MatronFileMissingError(templateFolderAbsolutePath);
      } else {
        matronFileAbsolutePath = path.join(templateFolderAbsolutePath, './matron.yml');
      }
      setupEnvironmentVariables(templateFolderAbsolutePath);
    }

    if (matronFileRelativePath) {
      matronFileAbsolutePath = getAbsolutePath(matronFileRelativePath);

      if (dotEnvFolderRelativePath) {
        const dotEnvFolderAbsolutePath = getAbsolutePath(dotEnvFolderRelativePath);
        setupEnvironmentVariables(dotEnvFolderAbsolutePath);
      }
    }

    if (matronFileAbsolutePath) {
      const matronService = getStateMachineInterpreter({});
      matronService.subscribe(state => {
        if (state.value === 'execute') {
          const jobs = state.context.jobs;
          const remainingJobs = Object.values(jobs.byId).filter(job => !job.executed);
          if (remainingJobs.length > 0) {
            matronService.send(executeJob({ jobItem: remainingJobs[0] }));
          }
        }
      });
      matronService.send(startParse({ matronFilePath: matronFileAbsolutePath }));
    } else {
      throw new GenericError(`
Unable to find a matron.yml file with the following parameters:
  - matronFileRelativePath: ${matronFileRelativePath}
  - dotEnvFolderRelativePath: ${dotEnvFolderRelativePath}
  - templateFolderRelativePath: ${templateFolderRelativePath}
  `);
    }
  }
}

interface RequiredArgs {
  matronFileRelativePath?: string;
  templateFolderRelativePath?: string;
}
function validateRequiredArgs(args: RequiredArgs) {
  const { matronFileRelativePath, templateFolderRelativePath } = args;
  if (matronFileRelativePath && templateFolderRelativePath) {
    throw new ArgsConflictError('matronFileRelativePath', 'templateFolderRelativePath');
  } else if (!matronFileRelativePath && !templateFolderRelativePath) {
    throw new RequiredArgsError('matronFileRelativePath', 'templateFolderRelativePath');
  } else {
    return true;
  }
}

function getAbsolutePath(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

function setupEnvironmentVariables(dotEnvFolderAbsolutePath: string) {
  const result = dotenv.config({
    path: dotEnvFolderAbsolutePath
  });
  if (result.error) {
    throw result.error;
  }
}
