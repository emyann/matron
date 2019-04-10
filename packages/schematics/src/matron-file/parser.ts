interface Command {
  cmd: keyof typeof CommandType;
  args: string[];
}

enum CommandType {
  COPY = 'COPY',
  RUN = 'RUN',
  WORKDIR = 'WORKDIR'
}

function getCommand(line: string) {
  const commandType = getCommandType(line);
  switch (commandType) {
    case CommandType.COPY: {
      return parseCopy(line);
    }
    case CommandType.RUN: {
      return parseRun(line);
    }
    case CommandType.WORKDIR: {
      return parseWorkdir(line);
    }
    default: {
      throw new Error(`Command ${commandType} unknown`);
    }
  }
}

function parseRun(line: string) {
  const reg = new RegExp(/(?<cmd>^\w+)\s+['|"](?<args>.*)['|"]/);
  const match = reg.exec(line);
  if (match && match.groups) {
    return { cmd: match.groups.cmd as 'RUN', args: [match.groups.args] };
  } else {
    throw new Error('Unable to parse RUN command');
  }
}

function parseCopy(line: string) {
  const reg = new RegExp(/(?<cmd>^\w+)\s+(?<args>.*)/);
  const match = reg.exec(line);
  if (match && match.groups) {
    return { cmd: match.groups.cmd as 'COPY', args: match.groups.args.split(/\s+/) };
  } else {
    throw new Error('Unable to parse COPY command');
  }
}

function parseWorkdir(line: string) {
  const reg = new RegExp(/(?<cmd>^\w+)\s+(?<args>.*)/);
  const match = reg.exec(line);
  if (match && match.groups) {
    return { cmd: match.groups.cmd as 'WORKDIR', args: match.groups.args.split(/\s+/) };
  } else {
    throw new Error('Unable to parse WORKDIR command');
  }
}

export function parser(content: string) {
  const cmds: Command[] = [];
  return content
    .split('\n')
    .map(formatLine)
    .reduce((acc, line, index) => {
      if (isValidCommand(line)) {
        try {
          acc.push(getCommand(line));
        } catch (err) {
          console.error(`Error at line ${index + 1}`);
          throw err;
        }
      }
      return acc;
    }, cmds);
}

function isEmptyLine(line: string) {
  return line === '';
}

function formatLine(line: string) {
  return line.trim();
}
function isValidCommand(line: any) {
  return !isEmptyLine(line) && !isComment(line);
}

function isComment(line: string) {
  return line.startsWith('#');
}

function getCommandType(line: string) {
  const reg = new RegExp(/^\w+/, 'g');
  const match = line.match(reg);
  if (match) return match[0] as CommandType;
}
