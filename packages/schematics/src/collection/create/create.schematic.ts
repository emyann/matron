import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  apply,
  url,
  move,
  branchAndMerge,
  mergeWith
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import path from 'path';
import { readFileSync } from 'fs';
import { parser } from '../../matron-file/parser';
// import { executeTask } from '../add';
// import { executeTask } from ';

export interface CreateSchema {
  name: string;
  projectPath: string;
  templatePath: string;
  skipInstall?: boolean;
}

export function create(options: CreateSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const { projectPath, templatePath, skipInstall } = options;
    const templateSource = apply(url(templatePath), [move(projectPath)]);

    // const matronFile = readFileSync(path.join(templatePath, './matron.txt'), 'utf8');
    console.log('template path', templatePath, path.join(templatePath, './Matronfile'));
    const matronFile = readFileSync(path.join(templatePath, './Matronfile'), 'utf8');
    console.log('matronFile', matronFile);
    const commands = parser(matronFile);
    // commands.forEach(command => {
    //   if (command.cmd === 'RUN') {
    //     const cmd = command.args[0].split(' ');
    //     const exec = cmd.shift();
    //     if (exec) executeTask({ command: exec, args: cmd });
    //   }
    // });
    console.log('commands', commands);
    // Need to extract the relative path of the cwd because of https://github.com/angular/angular-cli/issues/13526
    const curDir = process.cwd();
    const dirRelativePath = path.relative(curDir, projectPath);

    installNpmDeps(skipInstall, dirRelativePath, context);
    const res = chain([branchAndMerge(mergeWith(templateSource))])(host, context);
    return res;
  };
}

function installNpmDeps(skipInstall: boolean | undefined, dir: string, context: SchematicContext) {
  if (!skipInstall) {
    const task = new NodePackageInstallTask(dir);
    context.addTask(task);
  }
}
