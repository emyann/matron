## Development

### `npm install`

### `npm start`

In `packages/cli`, run:

```
npm run dev -- create test -p typescript-webpack
```

### TODO

- [ ] Calculate distance between provided template name and the closest template found in order to suggest the user a right template
- [ ] Display help when user does not provide a project name
- [ ] Add Template `typescript-webpack-jest`
- [ ] Add Template `typescript-jest`
- [ ] Add Template `typescript-ncc`
- [ ] Add schematics `add` action to allow:
  - [ ] `matron add webpack`
  - [ ] `matron add jest`
  - [ ] `matron add [BUNDLER]`
  - [ ] `matron add [TESTFRAMEWORK]`
