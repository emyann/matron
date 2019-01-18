import yargs from 'yargs';
import { createCommand } from './create';
import { addCommand } from './add';
import chalk from 'chalk';
import { snapshot } from './snapshot/snapshot';
import { templates } from './templates/templates.list';

const usage = `
Usage
  ${chalk.green('matron')} create ts-hello-world
  ${chalk.green('matron')} create dry-run-example -d
  ${chalk.green('matron')} create from-template -t typescript-parcel
  ${chalk.green('matron')} templates list
  ${chalk.green('matron')} snapshot ./ ./my-boilerplate -i "dist/**" "node_modules/**"
  `;

yargs.usage(usage);
yargs.command(createCommand);
// yargs.command(addCommand);
yargs.command(snapshot);
yargs.command(templates);

yargs.help().wrap(110).argv;
