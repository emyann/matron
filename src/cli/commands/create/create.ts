import { Argv } from 'yargs';
import { run } from '../../../core/runner';
import { existsSync, lstatSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import {
  NotAFolderError,
  FolderNotExistsError,
  NotAFileError,
  FileNotExistsError,
  ArgsConflictError,
  RequiredArgsError,
  GenericError
} from '../../utilities/errors';

const PROJECT_PATH_VAR = 'PROJECT_PATH';

export enum CommandOptions {
  ProjectPath = 'project',
  Template = 'template',
  MatronFile = 'matron-file',
  EnvFolder = 'env-folder'
}
export const command = 'create';
export const describe = 'Scaffold a new project';
export const builder = (yargs: Argv) => {
  return yargs
    .usage(
      `
Usage
  ${chalk.green('matron')} create --matron-file=./matron.yml
  ${chalk.green('matron')} create --matron-file=./matron.yml --env-folder ./dotenv/folder
  `
    )
    .options({
      [CommandOptions.ProjectPath]: {
        alias: 'p',
        describe: 'Name or Path of the project to create.',
        type: 'string'
      },
      [CommandOptions.Template]: {
        alias: 't',
        describe: 'Folder containing at least a matron.yml file.',
        type: 'string'
      },
      [CommandOptions.MatronFile]: {
        alias: 'f',
        describe: 'Matron file path.',
        type: 'string'
      },
      [CommandOptions.EnvFolder]: {
        describe: '.env files folder.',
        type: 'string'
      }
    })
    .check(checkRequiredArgs)
    .check(checkEnvFolder)
    .check(checkMatronFile)
    .check(checkProjectPath)
    .version(false);
};
export const handler = (args: Arguments) => {
  const matronFileRelativePath = args[CommandOptions.MatronFile];
  const dotEnvFolderRelativePath = args[CommandOptions.EnvFolder];
  const templateFolderRelativePath = args[CommandOptions.Template];
  const projectRelativePath = args[CommandOptions.ProjectPath];

  if (projectRelativePath) {
    process.env[PROJECT_PATH_VAR] = projectRelativePath;
  }
  run({ dotEnvFolderRelativePath, templateFolderRelativePath, matronFileRelativePath });
};

export type CommandBuilder = typeof builder;
export type Arguments = ReturnType<CommandBuilder>['argv'];

function checkRequiredArgs(args: any) {
  const matronFileRelativePath = args[CommandOptions.MatronFile] as string;
  const templateFolderRelativePath = args[CommandOptions.Template] as string;
  if (matronFileRelativePath && templateFolderRelativePath) {
    throw new ArgsConflictError(CommandOptions.MatronFile, CommandOptions.Template);
  } else if (!matronFileRelativePath && !templateFolderRelativePath) {
    throw new RequiredArgsError(CommandOptions.MatronFile, CommandOptions.Template);
  } else {
    return true;
  }
}
function checkEnvFolder(args: any) {
  const dotEnvFolderRelativePath = args[CommandOptions.EnvFolder] as string;
  if (dotEnvFolderRelativePath) {
    const absolutePath = path.join(process.cwd(), dotEnvFolderRelativePath);
    if (existsSync(absolutePath)) {
      if (lstatSync(absolutePath).isDirectory()) {
        return true;
      } else {
        throw new NotAFolderError(absolutePath, `--${CommandOptions.EnvFolder}`);
      }
    } else {
      throw new FolderNotExistsError(absolutePath, `--${CommandOptions.EnvFolder}`);
    }
  }
  return true;
}

function checkMatronFile(args: any) {
  const matronFileRelativePath = args[CommandOptions.MatronFile] as string;
  if (matronFileRelativePath) {
    const absolutePath = path.join(process.cwd(), matronFileRelativePath);
    if (existsSync(absolutePath)) {
      if (lstatSync(absolutePath).isFile()) {
        return true;
      } else {
        throw new NotAFileError(absolutePath, `--${CommandOptions.MatronFile}`);
      }
    } else {
      throw new FileNotExistsError(absolutePath, `--${CommandOptions.MatronFile}`);
    }
  }
  return true;
}

function checkProjectPath(args: any) {
  const projectRelativePath = args[CommandOptions.ProjectPath] as string;
  if (projectRelativePath && process.env[PROJECT_PATH_VAR]) {
    throw new GenericError(`${PROJECT_PATH_VAR} environment variable can't be used jointly with --${CommandOptions.ProjectPath}.`);
  } else {
    if (projectRelativePath) {
      const absolutePath = path.join(process.cwd(), projectRelativePath);
      if (existsSync(absolutePath)) {
        if (lstatSync(absolutePath).isDirectory()) {
          return true;
        } else {
          throw new NotAFolderError(absolutePath, `--${CommandOptions.ProjectPath}`);
        }
      }
    }
  }
  return true;
}
