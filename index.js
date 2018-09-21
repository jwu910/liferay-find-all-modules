#!/usr/bin/env node

const app = require('./dist/app');

app.main(process.argv.slice(2));
