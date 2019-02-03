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

function getDestinationDirectory(dir: string | undefined) {
  const chance = new Chance();

  if (!dir) {
    return strings.dasherize(`./${chance.first()}${chance.animal({ type: 'desert' })}`);
  } else if (!path.isAbsolute(dir)) {
    return path.join(process.cwd(), dir);
  } else {
    return dir;
  }
}

export function snapshot(options: SnapshotSchema): Rule {
  const defaultOptions = {
    ignore: ['node_modules', 'node_modules/**/*', 'package-lock.json', 'CHANGELOG.md', '.DS_Store']
  };
  const { path: pathToSnapshot = './' } = options;
  const ignore = !options.ignore ? defaultOptions.ignore : defaultOptions.ignore.concat(options.ignore);

  const destination = getDestinationDirectory(options.destination);

  return (host: Tree, _context: SchematicContext) => {
    const filesPath = globby.sync('**', {
      cwd: pathToSnapshot,
      ignore,
      gitignore: true
    });
    filesPath.forEach(filePath => {
      const targetPath = path.join(destination, filePath);
      const sourcePath = path.join(pathToSnapshot, filePath);
      const fileEntry = host.get(sourcePath);

      if (fileEntry) {
        if (!host.exists(targetPath)) {
          host.create(targetPath, fileEntry.content);
        } else {
          host.overwrite(targetPath, fileEntry.content);
        }
      }
    });

    return host;
  };
}
