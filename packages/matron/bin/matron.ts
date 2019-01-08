#!/usr/bin/env node

import yargs from 'yargs';
import { createCommand } from '../src/create';
import { addCommand } from '../src/add';
import chalk from 'chalk';

const usage = `
Usage
  ${chalk.green('matron')} create typescript-project
  ${chalk.green('matron')} create dry-run-example --dry-run
  `;

yargs.usage(usage);
yargs.command(createCommand);
yargs.command(addCommand);
yargs.help().wrap(110).argv;
