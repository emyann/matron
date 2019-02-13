import globby from 'globby';
import path from 'path';
import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getFilesMapping, SnapshotSchema, DEFAULT_IGNORE, getDestinationDirectory } from './snapshot.schematic';

describe('Snapshot', () => {
  const schematicRunner = new SchematicTestRunner('@matron/schematics', require.resolve('../../collection.json'));

  beforeEach(() => {
    // jest.clearAllMocks();
  });
  it('should create a map of source and target files using globby get the paths', () => {
    const SOURCE_FILES = [`file1.ts`, `folder/file2.ts`];
    const source = '/path/to/snapshot';
    const target = '/destination';
    const ignore: string[] = [];

    withFiles(source, ignore, SOURCE_FILES);

    const mapping = getFilesMapping(source, target, ignore);
    expect(mapping).toEqual([
      { source: `${source}/${SOURCE_FILES[0]}`, target: `${target}/${SOURCE_FILES[0]}` },
      { source: `${source}/${SOURCE_FILES[1]}`, target: `${target}/${SOURCE_FILES[1]}` }
    ]);
  });

  it('should snapshot', async () => {
    const source = '/source';
    const target = '/destination';
    const ignore: string[] = [];
    const SOURCE_FILES = [`file1.ts`, `folder/file2.ts`];
    withFiles(source, ignore, SOURCE_FILES);

    const initialTree = new HostTree();

    initialTree.create(`${source}/file1.ts`, '');
    initialTree.create(`${source}/folder/file2.ts`, '');
    const tree = schematicRunner.runSchematic<SnapshotSchema>(
      'snapshot',
      {
        path: source,
        destination: target
      },
      initialTree
    );

    expect(tree.files).toEqual(
      jasmine.arrayContaining([`${target}/${SOURCE_FILES[0]}`, `${target}/${SOURCE_FILES[1]}`])
    );
  });

  it('should transform a relative path to an absolute path', () => {
    const relativePath = './';
    const absolutePath = getDestinationDirectory(relativePath);
    expect(absolutePath).toBe(path.join(process.cwd(), relativePath));
  });
  it(`should return path unchanged if it's an absolute path`, () => {
    const absolutePath = '/absolute/path';
    expect(absolutePath).toBe(getDestinationDirectory(absolutePath));
  });
  it(`should return absolut path with a random folder name when no one is provided`, () => {
    expect(getDestinationDirectory(undefined)).toMatch(process.cwd());
  });
});
function withFiles(source: string, ignore: string[], SOURCE_FILES: string[]) {
  let fn = jest.fn();
  fn.mockImplementation((...args) => {
    const { cwd, ignore: ignoreOption, gitignore } = args[1];
    expect(cwd).toEqual(source);
    expect(ignoreOption).toEqual(ignore.concat(DEFAULT_IGNORE));
    expect(gitignore).toBe(true);
    return SOURCE_FILES;
  });
  globby.sync = fn;
}
