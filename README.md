[![Build Status](https://travis-ci.org/beckend/redux-mw-async-flow.svg?branch=master)](https://travis-ci.org/beckend/redux-mw-async-flow)
[![Coverage Status](https://coveralls.io/repos/github/beckend/redux-mw-async-flow/badge.svg?branch=master)](https://coveralls.io/github/beckend/redux-mw-async-flow?branch=master)
[![Dependency Status](https://img.shields.io/david/beckend/redux-mw-async-flow.svg?maxAge=2592000)](https://david-dm.org/beckend/redux-mw-async-flow)
[![DevDependency Status](https://img.shields.io/david/dev/beckend/redux-mw-async-flow.svg?maxAge=2592000)](https://david-dm.org/beckend/redux-mw-async-flow?type=dev)

# redux-mw-async-flow - redux async handling for any actions without enforcing API client implementation
* Uses redux standard action objects
* ES5/ES2015/ES2017 commonjs module, main is ES2015
* Note: ES5 module version needs a string.prototype.endsWith polyfill

# Contributing

### Requires
- `npm -g i gulp-cli jest-cli`.
- optional and faster `yarn` - `yarn install`, `yarn add global gulp-cli jest-cli`.

### Usage
- `gulp --tasks` to get going.

### Developing
- `jest --watchAll` to watch recompiled files and rerun tests.

### Testing
Supports:
- `jest`, needs `jest-cli` installed. it will execute the transpiled files from typescript.
- `npm run docker-test` requires `docker`, `docker-compose` to be installed.

### Dist
- `gulp` will run default task which consist of running tasks:
- `lint`, `clean`, `build`, `minify` then `jest` and collect coverage.

Note all `minified` files are `ES5`.
