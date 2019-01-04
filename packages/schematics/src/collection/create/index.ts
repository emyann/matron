import { strings, normalize } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree, chain, schematic } from '@angular-devkit/schematics';
import path from 'path';
import { updateJsonInTree } from '../../helpers/ast-utils';
import { AddSchema } from '../add';

interface Schema {
  name: string;
  template: string;
  provider: 'local';
}
export function create(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const projectPath = normalize('/' + strings.dasherize(options.name));

    const projectName = projectPath.split(path.sep).pop();
    return chain([
      schematic<AddSchema>('add', {
        recipe: 'typescript',
        projectPath,
        projectName: projectName ? projectName : strings.dasherize(options.name)
      })
    ])(host, context);
  };
}

export function updatePackageJson(options: Schema): Rule {
  return (_host: Tree, _context: SchematicContext) => {
    const projectPath = normalize('/' + strings.dasherize(options.name));
    return updateJsonInTree(projectPath + '/package.json', json => {
      const { scripts, devDependencies, version, main, description } = json;
      return { scripts, devDependencies, version, main, description };
    });
  };
}
