# Matron
[![npm](https://img.shields.io/npm/v/matron.svg?style=for-the-badge)](https://www.npmjs.com/package/matron) [![npm](https://img.shields.io/npm/dy/matron.svg?style=for-the-badge)](https://npm-stat.com/charts.html?package=matron) [![CircleCI (all branches)](https://img.shields.io/circleci/project/github/emyann/matron/master.svg?style=for-the-badge)](https://circleci.com/gh/emyann/matron)


*Kick off your next project without configuring a build system ✋🏼  Just focus on the code 👈🏼*
- [Matron](#matron)
  - [Getting Started](#getting-started)
  - [Features](#features)
  - [Commands](#commands)
    - [`matron create`](#matron-create)
    - [`matron snapshot`](#matron-snapshot)
    - [`matron templates list`](#matron-templates-list)

## Getting Started

**Using `npx`**

```sh
npx matron create ts-app
```

**Install with `npm`**

```sh
npm i -g matron
matron create ts-app
```

## Features
- **Dry run mode**: Commands are run against a virtual file system before they are applied. ([read more about schematics](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2))
- **TypeScript First**: Matron is strongly oriented to produce enterprise-grade TypeScript projects but also support a broad range of JavaScript templates.
- **Integrations**: Ability to start a project out of popular frameworks templates like [`create-react-app`](https://github.com/facebook/create-react-app), [`now`](https://github.com/zeit/now-examples)

## Commands

### `matron create`

> Create a project

**Usage**

```sh
matron create <name> [--template] [--dry-run] [--skip-install]
```

**Arguments**

- **`name`**: Name or path of the project (e.g `matron create path/to/my/project`).

**Options**
-  **`--template`, `-t`**: Create a project out of a specific template.
   -  ﹩`matron create ts-app --template typescript-parcel`
- **`--skip-install`, `-s`**: Skip the installation of npm dependencies.
  - ﹩`matron create ts-app --skip-install`
- **`--dry-run`, `-d`**:  Run the command in Dry Run mode. It will only simulate the command with no modifications applied on the file system.
  - ﹩`matron create ts-app --dry-run` 


### `matron snapshot`

> Snapshot a state of your file system to create a template.

**Usage**

```sh
matron snapshot [path] [destination] [--ignore] [--dry-run]
```

**Arguments**

**`path`**: Directory to snapshot.
**`destination`**: Destination directory where to store the snapshot.

**Options**

| Name, Shortcut    | Description                                                                                                          | Example                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `--ignore`, `-i`  | Specify glob files to ignore.                                                                                        | `matron snapshot ./ /my-boilerplate -i "dist/**" "node_modules/**"` |
| `--dry-run`, `-d` | Run the command in Dry Run mode. It will only simulate the command with no modifications applied on the file system. | `matron snapshot --dry-run`                                         |


### `matron templates list`

> List the available templates

**Usage**

```sh
matron templates list
```
