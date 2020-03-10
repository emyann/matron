import { Argv } from 'yargs';
import chalk from 'chalk';
import { checkRequiredArgs, checkMatronFile } from '../../utilities/args-validation';
import { getAbsolutePath, getMatronFileAbsolutePathFromTemplateFolder } from '../../../common/helpers';
import fse from 'fs-extra';
import { lint, loadMatronDocument, LinterError } from '../../../core/parser/parser';
import { fmtSuccess, fmtError, fmtWarn } from '../../utilities/log';
export enum CommandOptions {
  Template = 'template',
  MatronFile = 'matron-file'
}

export const command = 'lint';
export const describe = 'Lint your matron file';

export const builder = (yargs: Argv) => {
  return yargs
    .usage(
      `
Usage
  ${chalk.green('matron')} lint --matron-file=./matron.yml
  ${chalk.green('matron')} lint --template=path/to/template/folder
    `
    )
    .options({
      [CommandOptions.Template]: {
        alias: 't',
        describe: 'Folder containing at least a matron.yml file.',
        type: 'string'
      },
      [CommandOptions.MatronFile]: {
        alias: 'f',
        describe: 'Matron file path.',
        type: 'string'
      }
    })
    .check(checkRequiredArgs)
    .check(checkMatronFile)
    .version(false);
};

export const handler = (args: Arguments) => {
  const matronFileRelativePath = args[CommandOptions.MatronFile];
  const templateFolderRelativePath = args[CommandOptions.Template];
  if (matronFileRelativePath) {
    const matronFileAbsolutePath = getAbsolutePath(matronFileRelativePath);
    const matronFileContent = fse.readFileSync(matronFileAbsolutePath, 'utf8');
    try {
      const matronDocument = loadMatronDocument(matronFileContent);
      lint(matronDocument);
      console.log(fmtSuccess`Successfully linted ${matronFileAbsolutePath}!`);
    } catch (error) {
      if (error instanceof LinterError) {
        console.log(`
${fmtError`Unable to lint ${matronFileAbsolutePath} ¯\\_(ツ)_/¯`}
${fmtWarn`Errors: ${JSON.stringify(error.errors, null, 2)}`}
          `);
      } else {
        throw error;
      }
    }
  } else if (templateFolderRelativePath) {
    const templateFolderAbsolutePath = getAbsolutePath(templateFolderRelativePath);
    const matronFileAbsolutePath = getMatronFileAbsolutePathFromTemplateFolder(templateFolderAbsolutePath);
    const matronFileContent = fse.readFileSync(matronFileAbsolutePath, 'utf8');
    try {
      const matronDocument = loadMatronDocument(matronFileContent);
      lint(matronDocument);
      console.log(fmtSuccess`Successfully linted ${matronFileAbsolutePath}!`);
    } catch (error) {
      if (error instanceof LinterError) {
        console.log(`
${fmtError`Unable to lint ${matronFileAbsolutePath} ¯\\_(ツ)_/¯`}
${fmtWarn`Errors: ${JSON.stringify(error.errors, null, 2)}`}
          `);
      } else {
        throw error;
      }
    }
  }
};

export type CommandBuilder = typeof builder;
export type Arguments = ReturnType<CommandBuilder>['argv'];
