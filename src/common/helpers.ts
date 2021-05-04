import path from 'path';
import fse from 'fs-extra';
import { MatronFileMissingError } from '../cli/utilities/errors';

export function getAbsolutePath(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

export function getMatronFileAbsolutePathFromTemplateFolder(templateFolderAbsolutePath: string) {
  if (!fse.existsSync(path.join(templateFolderAbsolutePath, './matron.yml'))) {
    throw new MatronFileMissingError(templateFolderAbsolutePath);
  } else {
    return path.join(templateFolderAbsolutePath, './matron.yml');
  }
}
