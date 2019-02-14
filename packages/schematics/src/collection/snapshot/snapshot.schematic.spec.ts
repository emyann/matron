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
  // TODO: fix monkey mock on globby sync
  it('should skip file if cannot retrieve it on host', async () => {
    const source = '/source';
    const target = '/destination';
    const ignore: string[] = [];
    const SOURCE_FILES = [`file1.ts`, `folder/file2.ts`];
    withFiles(source, ignore, SOURCE_FILES);

    const initialTree = new HostTree();

    initialTree.create(`${source}/another-file.ts`, '');
    initialTree.create(`${source}/another-folder/file2.ts`, '');
    const tree = schematicRunner.runSchematic<SnapshotSchema>(
      'snapshot',
      {
        path: source,
        destination: target
      },
      initialTree
    );

    expect(tree.files).toEqual([`${source}/another-file.ts`, `${source}/another-folder/file2.ts`]);
  });

  it('should overwrite target snapshot if it already exists', async () => {
    const source = '/source';
    const target = '/destination';
    const ignore: string[] = [];

    const files = [`file1.ts`, `folder/file2.ts`];
    withFiles(source, ignore, files);

    const mockContent = 'content updated';
    const sourceFiles: File[] = files.map(file => ({ path: `${source}/${file}`, content: mockContent }));
    const targetFiles: File[] = files.map(file => ({ path: `${target}/${file}` }));
    const treeFiles = sourceFiles.concat(targetFiles);
    const initialTree = getTree(sourceFiles.concat(targetFiles));

    const tree = schematicRunner.runSchematic<SnapshotSchema>(
      'snapshot',
      {
        path: source,
        destination: target
      },
      initialTree
    );
    expect(tree.files).toEqual(treeFiles.map(f => f.path));

    tree.files.forEach(path => {
      const file = tree.get(path);
      expect(file).toBeTruthy();
      if (file) {
        expect(file.content.toString()).toEqual(mockContent);
      }
    });
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

  it('should create a snapshot from a path to a destination', async () => {
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
  it(`should return absolute path with a random folder name when no one is provided`, () => {
    expect(getDestinationDirectory(undefined)).toMatch(process.cwd());
  });
});

interface File {
  path: string;
  content?: string;
}
function getTree(files: File[] = []) {
  const tree = new HostTree();
  files.forEach(({ path, content = '' }) => {
    tree.create(path, content);
  });
  return tree;
}
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
