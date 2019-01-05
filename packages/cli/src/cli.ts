#!/usr/bin/env node
import version from './version';
import { command, parse } from 'commander';

version();
command('create <name>', 'Create a Typescript project');
command('add <recipe>', 'Runs a recipe against the current project');

parse(process.argv);
