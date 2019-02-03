# Matron

> Kick off your next project without configuring a build system ✋🏼
> **Just focus on the code 👈🏼**

[![npm](https://img.shields.io/npm/v/matron.svg?style=for-the-badge)](https://www.npmjs.com/package/matron) [![npm](https://img.shields.io/npm/dy/matron.svg?style=for-the-badge)](https://npm-stat.com/charts.html?package=matron) [![CircleCI (all branches)](https://img.shields.io/circleci/project/github/emyann/matron/master.svg?style=for-the-badge)](https://circleci.com/gh/emyann/matron)

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

- **`name`**: Name or path of the project to create.

**Options**

- **`--template`, `-t`**: Create a project out of a specific template.
- **`--skip-install`, `-s`**: Skip the installation of npm dependencies.
- **`--dry-run`, `-d`**: Run the command in Dry Run mode. It will only simulate the command with no modifications applied on the file system.

**Examples**

```sh
# creates TypeScript project configured with Parcel
matron create ts-app --template typescript-parcel

# creates the files but skip npm install
matron create path/to/my-app --skip-install

# only displays the files that will be created
matron create my-app -t typescript-webpack --dry-run
```

### `matron snapshot`

> Snapshot a state of your file system to create a template.

**Usage**

```sh
matron snapshot [path] [destination] [--ignore] [--dry-run]
```

**Arguments**

- **`path`**: Directory to snapshot.
- **`destination`**: Destination directory where to store the snapshot.

**Options**

- **`--ignore`, `-i`**: Specify glob files to ignore..
- **`--dry-run`, `-d`**: Run the command in Dry Run mode. It will only simulate the command with no modifications applied on the file system.

**Examples**

```sh
matron snapshot ./ /my-boilerplate -i "dist" "lib/**.spec.ts"

# snaphots the files in the current folder to a new folder friendly named
matron snapshot --dry-run
```

### `matron templates list`

> List the available templates

**Usage**

```sh
matron templates list
```
