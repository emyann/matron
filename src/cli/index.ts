import yargs, { CommandModule } from 'yargs';
import chalk from 'chalk';
import { create, lint } from './commands';
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
  .command(lint)
  .demandCommand()
  .recommendCommands()
  .strict().argv;
