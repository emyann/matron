#!/usr/bin/env node

import yargs from 'yargs';
import { createCommand } from './create';
import { addCommand } from './add';
import chalk from 'chalk';

const usage = `
Usage
  ${chalk.bgYellow(chalk.black('Using flags'))}
    ${'matron'} create --type ${chalk.green('typescript')} --bundler ${chalk.yellow('webpack')} --test ${chalk.magenta(
  'jest'
)}

  ${chalk.bgYellow(chalk.black('Using a naming convention'))}
    ${'matron'} create --template ${chalk.green('[TYPE]')}-${chalk.yellow('[BUNDLER]')}-${chalk.magenta(
  '[TESTFRAMEWORK]'
)}
    ${'matron'} create --template ${chalk.green('typescript')}-${chalk.yellow('parcel')}-${chalk.magenta(
  'karma-jasmine'
)}
  `;

yargs.usage(usage);
yargs.command(createCommand);
yargs.command(addCommand);
yargs.help().wrap(110).argv;
