import { version } from 'commander';
import * as packageJson from '../package.json';

interface Flag {
  name: string;
  alias: string;
}
const flags = {
  version: {
    name: 'version',
    alias: 'v'
  }
};

function generateFlags(option: Flag) {
  const alias = `-${option.alias}`;
  const name = `--${option.name}`;

  return `${alias}, ${name}`;
}

export default () => {
  version(packageJson.version, generateFlags(flags.version));
};
