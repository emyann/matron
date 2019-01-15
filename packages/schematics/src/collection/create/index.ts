import { Rule, SchematicContext, Tree, chain, schematic } from '@angular-devkit/schematics';
import { AddSchema } from '../add';

export interface CreateSchema {
  name: string;
  projectPath: string;
}
export function create(options: CreateSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const { name: projectName, projectPath } = options;

    return chain([
      schematic<AddSchema>('add', {
        recipe: 'typescript',
        projectPath,
        projectName
      })
    ])(host, context);
  };
}
