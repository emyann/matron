import { Rule, SchematicContext, chain, Tree } from '@angular-devkit/schematics';

import path from 'path';
import spawn from 'cross-spawn';
import { updateJsonInTree } from '../../helpers/ast-utils';

interface Recipe {
  tasks: Task[];
  rules?: Rule[];
}
interface RecipeRegistry {
  [recipeId: string]: Recipe;
}
const recipes: RecipeRegistry = {
  jest: {
    tasks: [
      { command: 'npm', args: ['install', '--save-dev', 'jest', 'typescript', 'ts-jest', '@types/jest'] },
      { command: 'node_modules/.bin/ts-jest config:init' }
    ],
    rules: [updatePackageJsonForJest()]
  },
  parcel: {
    tasks: [{ command: 'npm', args: ['install', '--save-dev', 'parcel-bundler', 'typescript'] }],

    rules: [updatePackageJsonForParcel(), addIndexHtml()]
  }
};
interface Schema {
  recipe: string;
}
export function add(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const { recipe: recipeId } = options;
    console.log('running add schematic with options', recipeId, options);
    const recipe = recipes[recipeId];
    recipe.tasks.forEach(task => {
      executeTask(task);
    });
    const rules = recipe.rules ? recipe.rules : [];
    return chain(rules)(host, context);
  };
}

function addIndexHtml(): Rule {
  return (host: Tree, _context: SchematicContext) => {
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>parcel app</title>
    </head>
    <body>  
    <div id="js-main" class="main">
    
    </div>
    <script src="./index.ts"></script>
    </body>
    </html>`;
    host.create('./src/index.html', html);
    return host;
  };
}
export function updatePackageJsonForParcel(options: any = {}): Rule {
  return (_host: Tree, _context: SchematicContext) => {
    const { projectPath = './' } = options;
    return updateJsonInTree(projectPath + '/package.json', json => {
      console.log('updateJsonInTree', json);
      const packageJson = {
        scripts: {
          start: 'parcel serve src/index.html',
          build: 'cross-env NODE_ENV=production parcel build src/index.html --public-url .'
        }
      };
      return { ...json, scripts: { ...json.scripts, ...packageJson.scripts } };
    });
  };
}

export function updatePackageJsonForJest(options?: any): Rule {
  return (_host: Tree, _context: SchematicContext) => {
    const { projectPath = './' } = options;
    return updateJsonInTree(projectPath + '/package.json', json => {
      console.log('updateJsonInTree', json);
      const packageJson = { scripts: { test: 'jest' } };
      return { ...json, ...packageJson };
    });
  };
}

interface Task {
  command: string;
  args?: string[];
}
export function executeTask(task: Task, directoryPath?: string) {
  if (!directoryPath) {
    directoryPath = path.resolve(process.cwd());
  }
  spawn.sync(task.command, task.args, { stdio: 'inherit', cwd: directoryPath });
}
