#!/usr/bin/env node
require('@babel/polyfill');

const app = require('./dist/app');

app.main(process.argv.slice(2));
