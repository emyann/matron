import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { CreateSchema } from './create.schematic';

describe('Snapshot', () => {
  const schematicRunner = new SchematicTestRunner('@matron/schematics', require.resolve('../../collection.json'));

  it('should create a project from a template', async () => {
    const options: CreateSchema = {
      name: 'my-project',
      templatePath: './__tests__/files', // real relative folder
      projectPath: '/target/my-project',
      skipInstall: true
    };

    const tree = schematicRunner.runSchematic<CreateSchema>('create', options);

    expect(tree.files).toEqual(
      jasmine.arrayContaining([`${options.projectPath}/file1.txt`, `${options.projectPath}/folder/file2.txt`])
    );
  });

  it('should create a project from a template and install npm deps', async () => {
    const options: CreateSchema = {
      name: 'my-project',
      templatePath: './__tests__/files', // real relative folder
      projectPath: '/target/my-project',
      skipInstall: false
    };

    const tree = schematicRunner.runSchematic<CreateSchema>('create', options);

    expect(tree.files).toEqual(
      jasmine.arrayContaining([`${options.projectPath}/file1.txt`, `${options.projectPath}/folder/file2.txt`])
    );
  });
});
