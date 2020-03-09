import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { morphism, createSchema } from 'morphism';
import Ajv, { ValidationError } from 'ajv';
import fse from 'fs-extra';
import path from 'path';
import jsonSchema from './schema.json';
import { Command, CommandType, Job, MatronDocumentJobStep, MatronDocument } from './parser.types';

export function loadFile(path: string) {
  return Promise.resolve(readFileSync(path, 'utf8'));
}
const toCommand = morphism(
  createSchema<Command, MatronDocumentJobStep>({
    cmd: step => {
      return Object.keys(step)[0] as CommandType;
    },
    args: step => {
      const argsStr = Object.values(step)[0];
      if (argsStr) {
        const args = argsStr.split(' ');
        return args;
      } else {
        return [];
      }
    }
  })
);

export function loadMatronDocument(content: string): MatronDocument {
  try {
    return yaml.safeLoad(content);
  } catch (error) {
    throw error;
  }
}
export function parser(content: string): Job[] {
  const doc = loadMatronDocument(content);
  lint(doc);
  return Object.entries(doc.jobs).map(([key, job]) => {
    return {
      key,
      name: job.name,
      steps: toCommand(job.steps)
    };
  });
}

export function lint(doc: MatronDocument) {
  const ajv = new Ajv();
  const validate = ajv.compile(jsonSchema);
  const isValid = validate(doc);
  if (!isValid) {
    throw new LinterError(validate.errors!);
  }
}

class LinterError extends Error {
  constructor(errors: Ajv.ErrorObject[]) {
    const message = `
Unable to validate the Matron file.
  Errors: ${JSON.stringify(errors, null, 2)}
    `;
    super(message);
  }
}

function getCommandParameters(commandString: string) {
  const regex = /\${(?<param>\w+)}/gm;
  const parameters: string[] = [];
  let matches;
  while ((matches = regex.exec(commandString)) !== null) {
    if (matches.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    if (matches.groups && matches.groups.param) parameters.push(matches.groups.param);
  }

  return parameters;
}

export function evaluate(command: Command): Command {
  const commandString = command.args.join(' ');
  const params = getCommandParameters(commandString);
  const evaluatedCommandString = params.reduce((acc, param) => {
    const value = process.env[param];
    if (value === undefined) throw new Error(`Parameter ${param} is not defined.`);
    return acc.replace(`\${${param}}`, value);
  }, commandString);
  return {
    cmd: command.cmd,
    args: evaluatedCommandString.split(' ')
  };
}

interface SpawnCommand {
  cmd: string;
  args: string[];
}

export function toSpawnCommand(command: Command): SpawnCommand {
  return {
    cmd: command.args[0],
    args: command.args.slice(1)
  };
}
