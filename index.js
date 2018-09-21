#!/usr/bin/env node
require('@babel/polyfill');

const path = require('path');

const app = require('./dist/app');

const dirs = path.resolve('./').split('/');
const currentDir = dirs[dirs.length - 1];

if (!currentDir.startsWith('osb-')) {
  process.stderr.write('Please call this from an OSB project');
  process.stderr.write(`Current dirname : ${currentDir}`);
  process.exit(1);
}

app.main(process.argv.slice(2));
