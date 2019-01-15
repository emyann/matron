import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export interface SnapshotSchema {
  path?: string;
}
export function snapshot(_options: SnapshotSchema): Rule {
  return (host: Tree, _context: SchematicContext) => {
    console.log('snapshot schematics...', host);
    return host;
  };
}
