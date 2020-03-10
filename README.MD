# Matron

> A Domain Specific Language à-la Dockerfile with a CLI to scaffold your projects.

[![npm](https://img.shields.io/npm/v/matron.svg?style=for-the-badge)](https://www.npmjs.com/package/matron) [![npm](https://img.shields.io/npm/dy/matron.svg?style=for-the-badge)](https://npm-stat.com/charts.html?package=matron) [![CircleCI (all branches)](https://img.shields.io/circleci/project/github/emyann/matron/master.svg?style=for-the-badge)](https://circleci.com/gh/emyann/matron)

- [Matron](#matron)
  - [Installation](#installation)
  - [Quick start](#quick-start)
  - [Commands](#commands)
    - [`matron create`](#matron-create)
    - [`matron lint`](#matron-lint)
  - [Matron File](#matron-file)
    - [Schema](#schema)
    - [Environments variables](#environments-variables)
      - [Dynamic variables](#dynamic-variables)
      - [Dotenv variables](#dotenv-variables)

## Installation

**Using `npx`**

If you don't prefer to install the CLI, you can use it through `npx` this way

```sh
npx matron --help
```

**Install with `npm`**

You can also install the CLI globally

```sh
npm i -g matron
matron --help
```

## Quick start

The minimal setup required to use matron and scaffold a new project is a **`matron.yml`** file.

Let's start with the example below:

📄 **`matron.yml`**

```yml
jobs:
  create-folder:
    name: Create project folder
    steps:
      - RUN: npx mkdirp ${PROJECT_PATH}
  init-project:
    name: Initialize package.json
    steps:
      - WORKDIR: ${PROJECT_PATH}
      - RUN: npm init -y
  add-typescript:
    name: Add TypeScript
    steps:
      - RUN: yarn add -D typescript
```

📺 **matron command**

```sh
matron create --matron-file=./matron.yml --project my-project
```

Let's break down each steps:

1. **Create project folder**

   1. `RUN: npx mkdirp ${PROJECT_PATH}`: With the `RUN` command you can execute any command that is possible to execute on your shell.
   2. Here we are using [`mkdirp`](https://www.npmjs.com/package/mkdirp) to create a folder at the path `my-project`.
   3. `${PROJECT_PATH}` is a default environment variable provided when you specify the option `--project`.

2. **Initialize package.json**
   1. `WORKDIR: ${PROJECT_PATH}`: With the `WORKDIR` command, all the subsequent `RUN` commands will be executed in the specified path, in this case `${PROJECT_PATH}` equals `my-project`.
   2. `RUN: npm init -y`: This will create a minimal `package.json` file.
3. **Add TypeScript**
   1. `RUN: yarn add -D typescript`: Add TypeScript as dev dependencies.

When executed, this will result in the following file tree:

```sh
my-project
├── node_modules
├── package.json
└── yarn.lock
```

💡**You can learn more about the available commands [here](#commands).**

💡**You can learn more about matron file schema [here](#matron-file).**

## Commands

### `matron create`

> **Create a project using a matron file**

```sh
matron create [--matron-file] [--project] [--template] [--env-folder]
```

**Options**

| Name              | Alias | Description                                                      |
| ----------------- | ----- | ---------------------------------------------------------------- |
| **--matron-file** | -f    | Matron file path.                                                |
| **--project**     | -p    | Name or Path of the project to create.                           |
| **--template**    | -t    | Relative path of a folder containing at least a matron.yml file. |
| **--env-folder**  |       | .env files folder.                                               |
| **--help**        |       | Show help                                                        |

<details><summary><strong>Examples</strong></summary>
<p>

```sh
# Creates a project at ./my-project using ./matron.yml file
matron create --matron-file=./matron.yml --project my-project

# Creates a project at path/to/ts-project using a template folder containing a matron.yml file and/or a .env file
matron create --template ./matron-templates/typescript --project path/to/ts-project
```

</p>
</details>

### `matron lint`

> **Lint your matron file**

```sh
matron lint [--matron-file] [--template]
```

**Options**

| Name              | Alias | Description                                                      |
| ----------------- | ----- | ---------------------------------------------------------------- |
| **--matron-file** | -f    | Matron file path.                                                |
| **--template**    | -t    | Relative path of a folder containing at least a matron.yml file. |

<details><summary><strong>Examples</strong></summary>
<p>

```sh
# Lint a matron file by providing its relative path
matron lint --matron-file=./matron.yml

# Lint a matron file by providing a folder relative path
matron lint --template=path/to/folder/template
```

</p>
</details>

## Matron File

### Schema

### Environments variables

#### Dynamic variables

#### Dotenv variables
