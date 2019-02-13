import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import path from 'path';
import Chance from 'chance';
import globby from 'globby';
export interface SnapshotSchema {
  path?: string;
  destination?: string;
  ignore?: string[];
}

export function snapshot(options: SnapshotSchema): Rule {
  const { path: pathToSnapshot = './', ignore } = options;
  const destination = getDestinationDirectory(options.destination);

  return (host: Tree, _context: SchematicContext) => {
    const mapping = getFilesMapping(pathToSnapshot, destination, ignore);

    mapping.forEach(({ source, target }) => {
      const fileEntry = host.get(source);

      if (fileEntry) {
        if (!host.exists(target)) {
          host.create(target, fileEntry.content);
        } else {
          host.overwrite(target, fileEntry.content);
        }
      }
    });

    return host;
  };
}

// TODO: chance init might be slow. monitor this
const chance = new Chance();

export function getDestinationDirectory(dir: string | undefined): string {
  if (dir) {
    if (path.isAbsolute(dir)) {
      return dir;
    } else {
      return path.join(process.cwd(), dir);
    }
  } else {
    const randomRelativedir = strings.dasherize(`./${chance.first()}${chance.animal({ type: 'desert' })}`);
    return getDestinationDirectory(randomRelativedir);
  }
}

export const DEFAULT_IGNORE = ['node_modules', 'node_modules/**/*', 'package-lock.json', 'CHANGELOG.md', '.DS_Store'];

export const getFilesMapping = (
  pathToSnapshot: string,
  destination: string,
  ignore?: string[]
): { source: string; target: string }[] => {
  ignore = !ignore ? DEFAULT_IGNORE : DEFAULT_IGNORE.concat(ignore);
  const filesPath = globby.sync('**', {
    cwd: pathToSnapshot,
    ignore,
    gitignore: true
  });

  const mapping = filesPath.map(filePath => {
    const source = path.join(pathToSnapshot, filePath);
    const target = path.join(destination, filePath);
    return { source, target };
  });

  return mapping;
};
