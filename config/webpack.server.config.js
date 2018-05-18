/* eslint-disable import/no-extraneous-dependencies */
// Requires
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
  context: path.join(__dirname, '../'),
  entry: {
    cli: ['./src/cli/index'],
  },
  plugins: [
    new CleanPlugin(['dist/cli'], {
      root: path.join(__dirname, '../'),
      exclude: 'index.js',
    }),
  ],
  target: 'node',
  devtool: 'cheap-module-source-map',
  output: {
    path: path.join(__dirname, '../dist/cli'),
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
    noParse: [/requireExternal/],
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: [/\.min\.js$/],
        use: 'eslint-loader',
      },
      {
        test: /\.js$/,
        exclude: [/\.min\.js$/],
        use: 'babel-loader',
      },
    ],
  },
};
