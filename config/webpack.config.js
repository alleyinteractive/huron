var webpack = require('webpack'),
    path = require('path');

export const defaultConfig = {
  entry: {},
  output: {
    // path: [huron root directory],
    filename: '[name].js',
    chunkFilename: '[name].chunk.min.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
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
    loaders: [
      {
        test: /\.html?$/,
        loader: 'dom?tag=dom-module!html',
        // include: ['path/to/templates']
      }
    ]
  },
  huron: {
    entry: 'huron',
    templates: 'prototype/partials',
    css: ['css/test.css'],
    scripts: ['js/test.js'],
    kss: ['css/'],
    port: 8080,
    root: 'dist/',
  }
};
