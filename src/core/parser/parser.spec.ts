import { loadMatronDocument, parser, lint, evaluate, toSpawnCommand } from './parser';
import { Command } from './parser.types';

describe('parser', () => {
  it('should parse a YAML file to a command', () => {
    const key = 'add-typescript';
    const name = 'Configuring TypeScript';
    const cmd = 'RUN';
    const args = ['yarn', 'add', '-D', 'typescript'];
    const yaml = `
        jobs:
            ${key}:
                name: ${name}
                steps:
                - ${cmd}: ${args.join(' ')}
        `;

    const jobs = parser(yaml);

    expect(jobs).toBeDefined();
    expect(jobs.length).toEqual(1);
    expect(jobs[0]).toEqual({ key, name, steps: [{ cmd, args }] });
  });

  it('should throw when yaml linter fails', () => {
    const yaml = `
      jobs:
        a-job:
          steps:
            - UNKNOWN_COMMAND: 12
    `;

    const doc = loadMatronDocument(yaml);
    const fn = () => lint(doc);
    expect(fn).toThrow();
  });
});

describe('evaluate', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // this is important - it clears the cache
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should properly evaluate a command with parameters / variables', () => {
    process.env.A_PARAM = 'something';

    const command: Command = {
      cmd: 'RUN',
      args: ['arg1', '${A_PARAM}']
    };
    const evaluatedCommand = evaluate(command);
    expect(evaluatedCommand).toEqual({ cmd: command.cmd, args: ['arg1', 'something'] });
  });

  it('should throw when a param is not defined', () => {
    const command: Command = {
      cmd: 'RUN',
      args: ['arg1', '${A_PARAM}']
    };

    const fn = () => evaluate(command);
    expect(fn).toThrow('Parameter A_PARAM is not defined');
  });
});

describe('spawn command', () => {
  it('should transform a yml command to a spawn command', () => {
    const command: Command = {
      cmd: 'RUN',
      args: ['arg1', 'arg2', 'arg3']
    };
    const spawnCommand = toSpawnCommand(command);
    expect(spawnCommand).toEqual({ cmd: 'arg1', args: ['arg2', 'arg3'] });
  });
});
