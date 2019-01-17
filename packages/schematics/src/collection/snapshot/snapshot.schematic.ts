import { Rule, SchematicContext, Tree, chain, filter } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import path from 'path';
import Chance from 'chance';
import minimatch from 'minimatch';
export interface SnapshotSchema {
  path?: string;
  destination?: string;
  ignore?: string[];
}

export function snapshot(options: SnapshotSchema): Rule {
  const chance = new Chance();
  const defaultOptions = {
    ignore: ['/node_modules/**/*', 'package-lock.json', 'CHANGELOG.md', '.DS_Store']
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

  const shouldBeIgnored = (filePath: string) =>
    finalOptions.ignore.some(
      ignored =>
        minimatch(filePath, `/${ignored}`, { dot: true, matchBase: true }) || filePath === normalize(`/${ignored}`)
    );
  return (host: Tree, context: SchematicContext) => {
    const ignoreFiles = filter(pathF => !shouldBeIgnored(pathF));

    const rule: Rule = host => {
      host.getDir(pathToSnapshot).visit((filePath, entry) => {
        if (entry) {
          host.create(normalize(path.join(destination, filePath)), entry.content);
        }
      });
      return host;
    };

    return chain([ignoreFiles, rule])(host, context);
  };
}
