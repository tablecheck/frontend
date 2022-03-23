#!/usr/bin/env node
// The purpose of this file is to give an averaged coverage report for gitlab ci to read.
const path = require('path');

const paths = require('../config/paths');

const coverage = require(path.resolve(
  paths.cwd,
  './coverage/coverage-summary.json'
));

const average =
  ['lines', 'statements', 'branches', 'functions'].reduce(
    (sum, key) => sum + coverage.total[key].pct,
    0
  ) / 4.0;

console.log('Coverage', average);
