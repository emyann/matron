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
  provider: 'local';
}
export function create(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const movePath = normalize('/' + strings.dasherize(options.name));

    let templateName;
    if (options.provider !== 'local') {
      templateName = `@matron/${options.template}`;
      installTemplate(templateName);
    } else {
      templateName = `@matron/templates/${options.template}`;
    }
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

function installTemplate(templateName: string) {
  console.log('installing template', templateName);

  const command = 'npm';
  const args = ['install', templateName, '--loglevel', 'error'];

  spawn.sync(command, args, { stdio: 'inherit', cwd: path.resolve(__dirname) });
}
