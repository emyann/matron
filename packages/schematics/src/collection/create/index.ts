import { strings, normalize } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  mergeWith,
  move,
  apply,
  chain,
  url,
  branchAndMerge
} from '@angular-devkit/schematics';
import * as spawn from 'cross-spawn';
import * as path from 'path';
import {
  // readJsonInTree,
  updateJsonInTree
} from '../../helpers/ast-utils';

interface Schema {
  name: string;
  template: string;
}
export function create(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    // console.log('options', options);

    const movePath = normalize('/' + strings.dasherize(options.name));
    const installTemplate = (template: string) => {
      console.log('installing template', template);

      const command = 'npm';
      const args = ['install', template, '--loglevel', 'error'];

      spawn.sync(command, args, { stdio: 'inherit', cwd: path.resolve(__dirname) });
    };
    const templateName = `@matron/${options.template}`;
    installTemplate(templateName);

    const templatePath = path.resolve(__dirname, '../../../node_modules', templateName);
    const template = apply(url(templatePath), [move(movePath)]);

    return chain([branchAndMerge(mergeWith(template)), updatePackageJson(options)])(host, context);
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
