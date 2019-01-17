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

export interface CreateSchema {
  name: string;
  projectPath: string;
  templatePath: string;
}
export function create(options: CreateSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const { projectPath, templatePath } = options;
    const templateSource = apply(url(templatePath), [move(projectPath)]);
    return chain([branchAndMerge(mergeWith(templateSource))])(host, context);
  };
}
