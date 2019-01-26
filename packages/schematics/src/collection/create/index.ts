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

export interface CreateSchema {
  name: string;
  projectPath: string;
  templatePath: string;
  skipInstall?: boolean;
}

export function create(options: CreateSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const { projectPath, templatePath, skipInstall } = options;
    console.log('host', host.root.subdirs, projectPath);
    const templateSource = apply(url(templatePath), [move(projectPath)]);

    if (!skipInstall) {
      console.log('here');
      context.addTask(new NodePackageInstallTask('temp/q08'));
    }

    return chain([branchAndMerge(mergeWith(templateSource))])(host, context);
  };
}
