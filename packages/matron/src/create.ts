import path from 'path';
import { CommandModule } from 'yargs';
import { strings } from '@angular-devkit/core';
import { UnsuccessfulWorkflowExecution } from '@angular-devkit/schematics';
import { Runner } from './RunnerFactory';
import { githubClient, ensureDirectory } from './templates/templates.list';
import { executeTask } from '@matron/schematics/dist/collection/add';
import { snapshotCommand } from './snapshot/snapshot';
import appRoot from 'app-root-path';
import chalk from 'chalk';
import { displayH1 } from './helpers';

interface CreateOptions {
  name: string;
  template?: string;
  skipInstall?: boolean;
  dryRun?: boolean;
  p: string;
}

export const createCommand: CommandModule<CreateOptions, CreateOptions> = {
  command: 'create <name>',
  describe: 'Start a Typescript Project',
  builder: {
    template: {
      alias: 't',
      describe: 'Set a template',
      type: 'string'
    },
    'skip-install': {
      alias: 's',
      describe: 'Skip npm dependencies installation',
      type: 'boolean',
      boolean: true
    },
    'dry-run': {
      alias: 'd',
      describe: 'Dry run',
      boolean: true
    }
  },
  handler: async args => {
    const options = {
      name: args.name,
      test: args.test,
      template: args.template,
      skipInstall: args.skipInstall ? true : false,
      dryRun: args.dryRun ? true : false,
      ...args
    };

    await create(options);
  }
};

const getTemplateLocation = (templateName: string) => `templates/src/${templateName}`;

const isDev = process.env.NODE_ENV === 'development';
async function create(options: CreateOptions) {
  const { name } = options;
  const { dryRun, skipInstall, template, p } = options;

  const normalizedName = path.resolve(strings.dasherize(name));
  const projectName = normalizedName.split(path.sep).pop();
  // const projectPath = path.join(process.cwd(), normalizedName);

  // console.log('options', options, p);
  const templateName = template ? template : 'hello-world';
  let templatePath = '';
  if (dryRun) {
    console.log(displayH1('Dry Run Mode'));
  }
  const templateCacheDir = path.join(appRoot.path, 'cache/templates/src');
  if (isDev) {
    templatePath = path.join(
      appRoot.path,
      'node_modules/@matron/schematics/node_modules/@matron',
      getTemplateLocation(templateName)
    );
  } else {
    templatePath = path.join(appRoot.path, 'cache', getTemplateLocation(templateName));
    if (!p) {
      // ATM lookup matron own templates hosted in github
      // TODO: At some point, should come from npm@version package
      console.log(chalk`{hex('#00b6ff') downloading template ${templateName} from github}`);
      await githubClient().downloadTemplate(templateName, templateCacheDir);
    } else {
      const tempCacheDir = path.join(appRoot.path, 'temp_cache/templates/src');
      ensureDirectory(tempCacheDir);
      // TODO: p param should be computed from template id
      switch (p) {
        case 'now':
          {
            const nowCommmand = [p, 'init', templateName];
            logInstallTemplate(templateName, 'Now CLI');
            executeTask({ command: `npx`, args: nowCommmand }, { cwd: tempCacheDir });
          }
          break;
        case 'cra':
          {
            const craCommand = ['create-react-app', templateName, '--typescript'];
            logInstallTemplate(templateName, 'create-react-app');

            executeTask({ command: `npx`, args: craCommand }, { cwd: tempCacheDir });
          }
          break;
        default: {
          console.error(`Unknown provider ${p}`);
        }
      }
      await snapshotCommand({
        dryRun: false,
        path: path.join(tempCacheDir, templateName),
        destination: path.join(templateCacheDir, templateName)
      });
    }
  }

  // console.log('templatePath', templatePath, normalizedName);

  try {
    // explicitly set path because of https://github.com/angular/angular-cli/issues/13526
    const runner = new Runner({ dryRun, path: process.cwd() });
    await runner.create({
      name: projectName ? projectName : name,
      projectPath: normalizedName,
      templatePath,
      skipInstall
    });
    // printFinalMessage(projectPath);

    // return 0;
  } catch (err) {
    if (err instanceof UnsuccessfulWorkflowExecution) {
      console.error('The Schematic workflow failed. See above.');
      // "See above" because we already printed the error.
      // logger.fatal('The Schematic workflow failed. See above.');
    } else {
      // logger.fatal(err.stack || err.message);
      // console.error('err', err);
    }

    return 1;
  }
}

function logInstallTemplate(templateName: string, providerName: string) {
  console.log(displayH1('Install template'), chalk`{hex('#00b6ff') ${templateName} from ${providerName}}`);
}
