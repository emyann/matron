import yargs, { CommandModule } from 'yargs';
import chalk from 'chalk';
import { create } from './commands';
const usage = `
Usage
  ${chalk.green('matron')} create --matron-file=./matron.yml
  ${chalk.green('matron')} create --matron-file=./matron.yml --env-folder ./dotenv/folder
  `;

yargs
  .usage(usage)
  .help()
  .wrap(yargs.terminalWidth())
  .showHelpOnFail(true)
  .command(create)
  .demandCommand()
  .recommendCommands()
  .strict().argv;
