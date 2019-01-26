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
  const chance = new Chance();
  const defaultOptions = {
    ignore: ['node_modules', 'node_modules/**/*', 'package-lock.json', 'CHANGELOG.md', '.DS_Store']
  };
  const {
    path: pathToSnapshot = './',
    destination = strings.dasherize(`./${chance.first()}${chance.animal({ type: 'desert' })}`),
    ignore
  } = options;

  const finalOptions = {
    pathToSnapshot,
    destination,
    ignore: !ignore ? defaultOptions.ignore : defaultOptions.ignore.concat(ignore)
  };

  console.log('snapshot', pathToSnapshot, destination);
  return (host: Tree, _context: SchematicContext) => {
    const filesPath = globby.sync('**', {
      cwd: pathToSnapshot,
      ignore: finalOptions.ignore
    });
    filesPath.forEach(filePath => {
      const targetPath = path.join(destination, filePath);
      const sourcePath = path.join(pathToSnapshot, filePath);
      const fileEntry = host.get(sourcePath);
      // console.log('filePath', filePath, sourcePath, targetPath);

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
