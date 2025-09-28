// This file is to help dependency scanners find dependencies that are
// somewhat hidden.
'use strict';

require('font-awesome');
require('vuejs-debug-traverse-210506-pmb');

require('browserslist-lint');
require('update-browserslist-db');

require('eslint-plugin-import');
require('eslint-plugin-regexp');


// css-loader for Vue components
require('css-loader');
require('sass-loader');
require('sass');
require('style-loader');


// for webpack
require('@babel/core');
require('semver');
require('webpack-cli');


// for ../.babelrc:
require('@babel/plugin-transform-runtime');
require('@babel/preset-env');
require('@babel/runtime');


