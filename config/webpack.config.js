var webpack = require('webpack'),
    path = require('path');

export const defaultConfig = {
  entry: {},
  output: {
    path: '/dist',
    filename: '[name].js',
    chunkFilename: '[name].chunk.min.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    modulesDirectories: [
      path.resolve(__dirname, '../src/js')
    ]
  },
  resolveLoader: {
    modulesDirectories: [
      'web_loaders',
      'web_modules',
      'node_loaders',
      'node_modules',
      path.resolve(__dirname, '../node_modules')
    ]
  },
  module: {
    loaders: [

    ]
  },
  huron: {
    templates: 'partials',
    css: ['static/css/test.css'],
    scripts: ['static/js/test.js'],
    kss: ['css/'],
    port: 8080,
    root: 'dist/',
    webpack: '../config/sample.config.js',
  }
};
