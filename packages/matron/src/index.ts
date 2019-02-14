import yargs from 'yargs';
import { createCommand } from './create';
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

yargs
  .usage(usage)
  .help()
  .wrap(110)
  .showHelpOnFail(true)
  .command(createCommand)
  .command(snapshot)
  .command(templates)
  .demandCommand(2, '').argv;
