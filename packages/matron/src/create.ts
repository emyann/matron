import path from 'path';
import { CommandModule } from 'yargs';
import { strings, normalize } from '@angular-devkit/core';
import { UnsuccessfulWorkflowExecution } from '@angular-devkit/schematics';
import { Runner } from './RunnerFactory';
import { npmInstall, printFinalMessage } from './helpers';
import { githubClient } from './templates/templates.list';

interface CreateOptions {
  name: string;
  template?: string;
  skipInstall?: boolean;
  dryRun?: boolean;
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
      dryRun: args.dryRun ? true : false
    };

    await create(options);
  }
};

const getTemplateLocation = (templateName: string) => `templates/src/${templateName}`;

const isDev = process.env.NODE_ENV === 'development';
async function create(options: CreateOptions) {
  const { name } = options;
  const { dryRun, skipInstall, template } = options;

  const normalizedName = normalize('/' + strings.dasherize(name));
  const projectName = normalizedName.split(path.sep).pop();
  // const projectPath = path.join(process.cwd(), normalizedName);

  const templateName = template ? template : 'hello-world';
  let templatePath = '';
  if (isDev) {
    templatePath = path.resolve(
      __dirname,
      '../../node_modules/@matron/schematics/node_modules/@matron/',
      getTemplateLocation(templateName)
    );
  } else {
    const templateCacheDir = path.resolve(__dirname, '../../cache/templates/src');
    await githubClient().downloadTemplate(templateName, templateCacheDir);
    templatePath = path.resolve(__dirname, '../../cache', getTemplateLocation(templateName));
  }

  // console.log('templatePath', templatePath);

  try {
    const runner = new Runner({ dryRun });
    await runner.create({
      name: projectName ? projectName : name,
      projectPath: normalizedName,
      templatePath,
      skipInstall
    });
    // printFinalMessage(projectPath);

    return 0;
  } catch (err) {
    if (err instanceof UnsuccessfulWorkflowExecution) {
      console.error('The Schematic workflow failed. See above.');
      // "See above" because we already printed the error.
      // logger.fatal('The Schematic workflow failed. See above.');
    } else {
      // logger.fatal(err.stack || err.message);
    }

    return 1;
  }
}
