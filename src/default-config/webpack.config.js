const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {},
  output: {
    // path: [huron root directory],
    filename: '[name].js',
    chunkFilename: '[name].chunk.min.js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    modulesDirectories: [
      path.resolve(__dirname, '../src/js'),
    ],
  },
  resolveLoader: {
    modulesDirectories: [
      'web_loaders',
      'web_modules',
      'node_loaders',
      'node_modules',
      path.resolve(__dirname, '../node_modules'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.html?$/,
        use: [
          {
            loader: 'dom-loader',
            options: {
              tag: 'dom-module',
            },
          },
          'html-loader',
        ],
        // include: ['path/to/templates']
      },
    ],
  },
};
