/* -*- tab-width: 2 -*- */
'use strict';

const webpack = require('webpack');
const absPath = require('absdir')(module, '.');

const addSourceMaps = false;
const sourceMapOpts = addSourceMaps && {
};


const cssLoaderOpts = { sourceMap: addSourceMaps };
if (absPath === '/app') {
  // Probably running in docker
  cssLoaderOpts.sourceMap = false; /*
    Error: "/tmp/…/quill/dist/quill.snow.css" is not in the SourceMap.
    Issue: https://github.com/webpack/webpack-sources/issues/90
    Fix: Update webpack soon[tm]. For now: Disable CSS source maps. */
}

const audience = (process.env.WEBPACK_AUDIENCE || 'dev');

module.exports = {
  entry: './entry.js',
  mode: (function guessAudience() {
    if (audience === 'prod') { return 'production'; }
    if (audience === 'dev') { return 'development'; }
    return audience;
  }()),
  devtool: false,
  // node: {fs: 'empty'},
  // target: 'node',
  plugins: [
    addSourceMaps && new webpack.SourceMapDevToolPlugin(sourceMapOpts),
  ].filter(Boolean),
  output: {
    path: absPath('dist'),
    filename: 'anno-frontend.' + audience + '.js',
  },
  optimization: {
    moduleIds: 'deterministic',
  },
  devServer: {
    publicPath: '/dist/',
    compress: true,
  },
  externals: {
    'quill/dist/quill.js': 'Quill',
    'axios': 'axios',
    '@ubhd/authorities-client': 'AuthoritiesClient',
    'semtonotes-utils': 'XrxUtils',
  },
  module: {
    rules: [
      { test: /\.png$/i,
        loader: 'url-loader',
      },
      { test: /\.svg$/i,
        loader: 'url-loader',
      },
      { test: /\/src\/components\/\S+.html$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: 'img:src bootstrap-button:src',
          },
        },
      },
      { test: /\.js$/,
        exclude: /\/node_modules\//,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true },
        },
      },
      { test: { or: [
          /\/node_modules\/quill\/\S+\.css$/,
          /\/src\/components\/\S+\.(s?css|sass)$/,
        ] },
        use: [
          // Order might be important here!
          { loader: 'style-loader' },
          { loader: 'css-loader', options: cssLoaderOpts },
          { loader: 'sass-loader', options: cssLoaderOpts },
        ],
      },
    ],
  },
};
