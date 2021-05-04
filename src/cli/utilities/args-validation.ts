import { ArgsConflictError, RequiredArgsError, NotAFileError, FileNotExistsError } from './errors';
import { CommandOptions } from '../commands/create/create';
import path from 'path';
import { existsSync, lstatSync } from 'fs-extra';

export function checkRequiredArgs(args: any) {
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

export function checkMatronFile(args: any) {
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
