> jsonlint-cli - cli wrapper for jsonlint

<p align="center">
  <img src="https://cdn.rawgit.com/marionebl/jsonlint-cli/master/jsonlint-cli.svg" width="300" height="52" />
</p>

Thin wrapper around [jsonlint](https://github.com/zaach/jsonlint) improving on its cli. It introduces glob expansion and advanced schema validation. Borrows heaviliy from `jsonlint` in every regard.

## Why should I use jsonlint-cli?
`jsonlint-cli` introduces valuable improvements and additions to the cli shipping with [jsonlint](https://github.com/zaach/jsonlint).

|Feature|jsonlint|jsonlint-cli|Description|
|-------|:------:|:----------:|:----------|
|json validity checking|:heavy_check_mark:|:heavy_check_mark:|jsonlint-cli uses jsonlint to parse and validate|
|local schema validation|:heavy_check_mark:|:heavy_check_mark:|specify local schemas to validate input against|
|read from stdin|:heavy_check_mark:|:heavy_check_mark:|stream json in via stdin|
|read from fs|:heavy_check_mark:|:heavy_check_mark:|specify file's path to lint|
|glob expansion|:x:|:heavy_check_mark:|specify globs of files to lint, e.g. `**/*.json`|
|remote schema validation|:x:|:heavy_check_mark:|specify remote schemas to validate input against, e.g. [package.json](http://json.schemastore.org/package)|
|v4 schema validation|:x:|:heavy_check_mark:|use v4 jsonschema|
|config files|:x:|:heavy_check_mark:|support for `eslint` style config files|

## Installation
```shell
# Install it from npm
npm install -g jsonlint-cli
```

### Usage
`jsonlint-cli` exposes a command line interface
```shell
jsonlint-cli --help
jsonlint-cli [options] [file] - cli wrapper for jsonlint

--s, --validate    uri to schema to use for validation, defaults to: "null"
--v, --version     show jsonlint-cli version
--i, --ignore      glob pattern to exclude from linting, defaults to: "node_modules/**/*"
--w, --indent      whitespace to use for pretty printing, defaults to: "  "
--p, --pretty      pretty-print the input, defaults to: "false"
--q, --quiet       surpress all output, defaults to: "false"
--h, --help        show this help
--e, --env         json schema env to use for validation, defaults to: "json-schema-draft-04"
```

## Configuration
`jsonlint-cli` picks up configuration files, searching upwards from `process.cwd()` or the file path
if specified.

### .jsonlintrc
```js
{
  "validate": "", // schema uri to validate agains
  "ignore": ["node_modules/**/*"], // glob patterns to ignore
  "indent": "", // indent to use for pretty-printed output
  "env": "json-schema-draft-03", // json schema env version to use
  "quiet": false, // suppress any output
  "pretty": true // pretty-print formatted json if quiet is false
}
```

### .jsonlintignore
```ini
node_modules/ # ignored by default
distribution/
```

---
Copyright 2016 by [Mario Nebl](https://github.com/marionebl) and [contributors](./graphs/contributors). Released under the [MIT license]('./license.md').
