// Requires
const webpack = require('webpack');
const path = require('path');
 /* eslint-disable */
const nodeExternals = require('webpack-node-externals');
const CleanPlugin = require('clean-webpack-plugin');
/* eslint-enable */

module.exports = function getConfig(env) {
  const context = path.join(__dirname, '../');
  const include = path.join(__dirname, '../src/cli');

  return {
    context,
    entry: {
      cli: ['./src/cli/index'],
    },
    plugins: [
      new CleanPlugin(['dist/cli'], {
        root: context,
        exclude: 'index.js',
      }),
    ],
    target: 'node',
    devtool: 'cheap-module-source-map',
    output: {
      path: path.join(context, 'dist/cli'),
      filename: 'index.js',
      chunkFilename: '[name].chunk.min.js',
      publicPath: '../',
    },
    externals: ['localConfig', 'localHuron'].concat(nodeExternals({
      whitelist: [/webpack\/hot/],
    })),
    node: {
      __filename: false,
      __dirname: false,
    },
    module: {
      noParse: [/requireExternal/, /hotTemplate/],
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          include,
          use: 'eslint-loader',
        },
        {
          test: /\.js$/,
          include,
          use: 'babel-loader',
        },
      ],
    },
  };
};
