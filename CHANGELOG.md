# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.15.0](https://github.com/emyann/matron/compare/v0.14.0...v0.15.0) (2019-03-01)


### Features

* add typescript webpack jest template ([c62ab6a](https://github.com/emyann/matron/commit/c62ab6a))





# [0.14.0](https://github.com/emyann/matron/compare/v0.13.7...v0.14.0) (2019-02-16)


### Features

* add react hook template ([e3a8569](https://github.com/emyann/matron/commit/e3a8569))





## [0.13.7](https://github.com/emyann/matron/compare/v0.13.6...v0.13.7) (2019-02-15)


### Bug Fixes

* update template to be publishable ([f35ebbc](https://github.com/emyann/matron/commit/f35ebbc))





## [0.13.6](https://github.com/emyann/matron/compare/v0.13.5...v0.13.6) (2019-02-14)

**Note:** Version bump only for package root





## [0.13.5](https://github.com/emyann/matron/compare/v0.13.4...v0.13.5) (2019-02-13)


### Bug Fixes

* lift dev deps to root ([3c5c3a6](https://github.com/emyann/matron/commit/3c5c3a6))





## [0.13.4](https://github.com/emyann/matron/compare/v0.13.3...v0.13.4) (2019-02-13)

**Note:** Version bump only for package root





## [0.13.3](https://github.com/emyann/matron/compare/v0.13.2...v0.13.3) (2019-02-13)


### Bug Fixes

* npmrc ([d3b0a55](https://github.com/emyann/matron/commit/d3b0a55))





## [0.13.2](https://github.com/emyann/matron/compare/v0.13.1...v0.13.2) (2019-02-13)


### Bug Fixes

* trigger ci ([6212b59](https://github.com/emyann/matron/commit/6212b59))





## [0.13.1](https://github.com/emyann/matron/compare/v0.13.0...v0.13.1) (2019-02-13)


### Bug Fixes

* authentication failing when publishing ([e4ed544](https://github.com/emyann/matron/commit/e4ed544))





# [0.13.0](https://github.com/emyann/matron/compare/v0.12.1...v0.13.0) (2019-02-13)


### Bug Fixes

* build system. update angular/schematics version. webpack magic ([a28771a](https://github.com/emyann/matron/commit/a28771a))
* fix output bundle of the cli ([44b6f5c](https://github.com/emyann/matron/commit/44b6f5c))
* remove cli types declaration ([70ded2a](https://github.com/emyann/matron/commit/70ded2a))
* split e2e step from UT step ([df364ad](https://github.com/emyann/matron/commit/df364ad))
* try autopublish on circleci ([d22fac8](https://github.com/emyann/matron/commit/d22fac8))
* use permanent bin file ([f09aa48](https://github.com/emyann/matron/commit/f09aa48))


### Features

* add jest and UTs for snapshot schematic ([3304fd2](https://github.com/emyann/matron/commit/3304fd2))
* use npm file specifiers ([f898d99](https://github.com/emyann/matron/commit/f898d99))





## [0.12.1](https://github.com/emyann/matron/compare/v0.12.0...v0.12.1) (2019-02-03)


### Bug Fixes

* fix issue with strip comment missing in deps ([e86b95a](https://github.com/emyann/matron/commit/e86b95a))





# [0.12.0](https://github.com/emyann/matron/compare/v0.11.0...v0.12.0) (2019-02-03)


### Bug Fixes

* allow relative path when creating projects ([6e0c760](https://github.com/emyann/matron/commit/6e0c760))
* normalize path if it exits before starting NodeWorkflow ([42a5e58](https://github.com/emyann/matron/commit/42a5e58))
* remove useless br on update log ([5ff37e9](https://github.com/emyann/matron/commit/5ff37e9))
* silly default value for ignore option ([e0af0fd](https://github.com/emyann/matron/commit/e0af0fd))
* use schematics task to install npm deps ([3c34489](https://github.com/emyann/matron/commit/3c34489))


### Features

* **schematics:** use globby instead of minimatch for snapshot schematics ([f44304b](https://github.com/emyann/matron/commit/f44304b))
* concurrently run matron and [@matron](https://github.com/matron)/schematics pkgs ([d789b9a](https://github.com/emyann/matron/commit/d789b9a))
* create chalk display helper ([2bb0b0f](https://github.com/emyann/matron/commit/2bb0b0f))
* create command support cra and now cli with dry-run ([1bb41e9](https://github.com/emyann/matron/commit/1bb41e9))
* improve messages display ([1e50cb8](https://github.com/emyann/matron/commit/1e50cb8))
* init create runner with current directory as root ([2c71a4a](https://github.com/emyann/matron/commit/2c71a4a))
* list template is displayed in table ([10302af](https://github.com/emyann/matron/commit/10302af)), closes [#13](https://github.com/emyann/matron/issues/13)
* transform path to absolute url when it's not ([c7ac51a](https://github.com/emyann/matron/commit/c7ac51a))





# [0.11.0](https://github.com/emyann/matron/compare/v0.10.0...v0.11.0) (2019-01-22)


### Bug Fixes

* add npmrc at build time ([d2c9eae](https://github.com/emyann/matron/commit/d2c9eae))
* npm run publish ([3d63b84](https://github.com/emyann/matron/commit/3d63b84))
* **templates:** fix nodemon issue on typescript-webpack ([8ca1200](https://github.com/emyann/matron/commit/8ca1200))


### Features

* add circle ci config ([618dfc4](https://github.com/emyann/matron/commit/618dfc4))
* **templates:** add typescript-webpack template ([95dfdd9](https://github.com/emyann/matron/commit/95dfdd9))





# [0.10.0](https://github.com/emyann/matron/compare/v0.9.0...v0.10.0) (2019-01-18)


### Features

* new release. more suited for production. update readmes ([e62920b](https://github.com/emyann/matron/commit/e62920b))





# [0.9.0](https://github.com/emyann/matron/compare/v0.8.5...v0.9.0) (2019-01-17)


### Bug Fixes

* temp fix to emit d.ts only in schematics ([835fffa](https://github.com/emyann/matron/commit/835fffa))


### Features

* add react-typescript template ([35986db](https://github.com/emyann/matron/commit/35986db))
* add snapshot command ([9ab1119](https://github.com/emyann/matron/commit/9ab1119))
* add templates list action ([faf303b](https://github.com/emyann/matron/commit/faf303b))
* bundling d.ts. use babel typescript preset along with webpack ([6d1bc55](https://github.com/emyann/matron/commit/6d1bc55))
* create a Runner Factory to handle NodeWorkflow creation ([93f46a5](https://github.com/emyann/matron/commit/93f46a5))
* export schematics schema types ([46878d3](https://github.com/emyann/matron/commit/46878d3))
* **matron:** use schematics types to validate params to execute ([6cf4f24](https://github.com/emyann/matron/commit/6cf4f24))
* get templates back ([60942b5](https://github.com/emyann/matron/commit/60942b5))
* **schematics:** update add schematics ([b0d24be](https://github.com/emyann/matron/commit/b0d24be))
* improve snapshot schematics ([ae82555](https://github.com/emyann/matron/commit/ae82555))
* update cli. add template list command. fetch templates from github ([20ec095](https://github.com/emyann/matron/commit/20ec095))





## [0.8.5](https://github.com/emyann/matron/compare/v0.8.4...v0.8.5) (2019-01-08)

**Note:** Version bump only for package root





## [0.8.4](https://github.com/emyann/matron/compare/v0.8.3...v0.8.4) (2019-01-08)

**Note:** Version bump only for package root





## [0.8.3](https://github.com/emyann/matron/compare/v0.8.2...v0.8.3) (2019-01-07)


### Bug Fixes

* cleanup executeTask ([5966906](https://github.com/emyann/matron/commit/5966906))





## [0.8.2](https://github.com/emyann/matron/compare/v0.8.1...v0.8.2) (2019-01-07)


### Features

* new release ([bbdab9f](https://github.com/emyann/matron/commit/bbdab9f))





## [0.8.1](https://github.com/emyann/matron/compare/v0.8.0...v0.8.1) (2019-01-06)


### Bug Fixes

* use npx to call schematics cli. will optimize in the future ([2a773fa](https://github.com/emyann/matron/commit/2a773fa))





# [0.8.0](https://github.com/emyann/matron/compare/v0.7.2...v0.8.0) (2019-01-06)


### Features

* prepare for CI ([90596c7](https://github.com/emyann/matron/commit/90596c7))
