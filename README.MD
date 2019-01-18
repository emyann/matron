# `Matron`

A comprehensive CLI for Rapid Application Development with TypeScript and more.

## Getting Started

**Immediately with `npx`**

```sh
npx matron create ts-app
```

**Or by installing it globally**

```sh
npm i -g matron
matron create ts-app
```

## Commands

### `matron create`

> Create a project

#### Usage

```sh
matron create <name> [--template] [--dry-run] [--skip-install]
```

#### Arguments

#### `name`

Name or path of the project (e.g `matron create path/to/my/project`)

#### Options

##### `--template`, `-t`

Create a project out of a specific template.

```sh
# `matron templates list` to display the available templates
matron create ts-app -t react-typescript

matron create ts-app --template typescript-parcel
```

##### `--skip-install`, `-s`

Skip the installation of npm dependencies.

```sh
matron create ts-app -s
matron create ts-app --skip-install
```

##### `--dry-run`, `-d`

Run the command in Dry Run mode. It will only simulate the command with no modifications applied on the file system.

```sh
matron create ts-app -d
matron create ts-app --dry-run
```

### `matron snapshot`

> Snapshot a state of your file system to create a template.

#### Usage

```sh
matron snapshot [path] [destination] [--ignore] [--dry-run]
```

#### Arguments

#### `path`

Directory to snapshot.

#### `destination`

Destination directory where to store the snapshot.

#### Options

##### `--ignore`, `-i`

Specify glob files to ignore.

```sh
# Will ignore dist and node_modules folders
matron snapshot ./ /my-boilerplate -i "dist/**" "node_modules/**"
```

##### `--dry-run`, `-d`

Run the command in Dry Run mode. It will only simulate the command with no modifications applied on the file system.

```sh
matron snapshot -d
```

### `matron templates list`

> List the available templates

#### Usage

```sh
matron templates list
```
