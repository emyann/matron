import {
  Rule,
  SchematicContext,
  chain,
  Tree,
  branchAndMerge,
  mergeWith,
  url,
  move,
  apply,
  template
} from '@angular-devkit/schematics';

import path from 'path';
import spawn from 'cross-spawn';
import { updateJsonInTree, serializeJson } from '../../helpers/ast-utils';
import { SpawnSyncOptions } from 'child_process';

interface Recipe {
  tasks?: Task[];
  rules?: ((options: AddSchema) => Rule)[];
}
interface RecipeRegistry {
  [recipeId: string]: Recipe;
}

type NPMDependencies = { [dependency: string]: string };
function getDependenciesLatestVersion(...dependencies: string[]) {
  return dependencies.reduce(
    (acc, dep) => {
      const response = executeTask(
        { command: 'npm', args: ['view', dep, 'dist-tags.latest'] },
        { stdio: [process.stdout] }
      );
      const latestVersion = response.stdout.toString().replace(/\n/g, '');
      acc[dep] = `^${latestVersion}`;
      return acc;
    },
    {} as NPMDependencies
  );
}

const recipes: RecipeRegistry = {
  typescript: {
    rules: [
      ({ projectPath }) =>
        addFile(
          `${projectPath}/tsconfig.json`,
          serializeJson({
            compilerOptions: {
              target: 'ES2015',
              module: 'commonjs',
              sourceMap: true,
              declaration: true,
              outDir: 'dist',
              strict: true,
              removeComments: true,
              esModuleInterop: true
            },
            include: ['src/**/*']
          })
        ),
      ({ projectPath }) =>
        updatePackageJson(
          {
            main: 'src/index.ts',
            scripts: { start: 'nodemon src/index.ts', build: 'tsc' },
            devDependencies: getDependenciesLatestVersion('cross-env', 'nodemon', 'ts-node', 'typescript')
          },
          projectPath
        ),
      ({ projectPath }) =>
        addFile(
          `${projectPath}/nodemon.json`,
          serializeJson({
            watch: ['src/**/*.ts'],
            execMap: {
              ts: 'ts-node',
              js: 'node'
            }
          })
        )
    ]
  },
  jest: {
    tasks: [
      { command: 'npm', args: ['install', '--save-dev', 'jest', 'typescript', 'ts-jest', '@types/jest'] },
      { command: 'node_modules/.bin/ts-jest', args: ['config:init'] }
    ],
    rules: [() => updatePackageJson({ scripts: { test: 'jest' } })]
  },
  parcel: {
    tasks: [{ command: 'npm', args: ['install', '--save-dev', 'parcel-bundler', 'typescript'] }],
    rules: [
      () =>
        updatePackageJson({
          scripts: {
            start: 'parcel serve src/index.html',
            build: 'cross-env NODE_ENV=production parcel build src/index.html --public-url .'
          }
        }),
      () => addIndexHtml()
    ]
  }
};

export interface AddSchema {
  recipe: string;
  projectPath: string;
  projectName: string;
}
export function add(options: AddSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const { recipe: recipeId, projectPath = path.resolve(process.cwd()), projectName } = options;
    // console.log('running add schematic with options', recipeId, options);
    const recipe = recipes[recipeId];
    if (recipe && recipe.tasks) {
      recipe.tasks.forEach(task => {
        // console.log('executing task', task, projectPath);
        executeTask(task, { cwd: projectPath });
      });
    }

    const templateSource = apply(url('./files/typescript'), [
      template({
        jsonPackage: { name: projectName }
      }),
      move(projectPath)
    ]);

    let rules: Rule[] = [branchAndMerge(chain([mergeWith(templateSource)]))];
    if (recipe.rules) {
      recipe.rules.forEach(fn => {
        rules.push(fn(options));
      });
    }

    return chain(rules)(host, context);
  };
}

function addFile(path: string, content: string): Rule {
  return (host: Tree, _context: SchematicContext) => {
    host.create(path, content);
    return host;
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

interface JSONPackage {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  scripts?: {};
  dependencies?: NPMDependencies;
  devDependencies?: NPMDependencies;
  keywords?: string[];
  author?: string;
  license?: string;
}
export function updatePackageJson(packageJson: JSONPackage, projetPath = './'): Rule {
  return (_host: Tree, _context: SchematicContext) => {
    return updateJsonInTree<JSONPackage>(projetPath + '/package.json', json => {
      return {
        ...json,
        ...packageJson,
        scripts: { ...json.scripts, ...packageJson.scripts },
        devDependencies: { ...json.devDependencies, ...packageJson.devDependencies }
      };
    });
  };
}

interface Task {
  command: string;
  args?: string[];
}
export function executeTask(task: Task, options: SpawnSyncOptions = { stdio: 'inherit' }) {
  const { stdio } = options;
  let { cwd } = options;
  if (!cwd) {
    cwd = path.resolve(process.cwd());
  }
  return spawn.sync(task.command, task.args, { stdio, cwd });
}
