#!/usr/bin/env node
import * as program from 'commander';
import chalk from 'chalk';
import version from './version';
import { command, parse, option, arguments, action } from 'commander';

// usage
// usage(`${chalk.bgGreen(getStr())}create ${chalk.green('<project-directory>')}`);

version();
command('create <name>', 'Create a Typescript project');
parse(process.argv);
