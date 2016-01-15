'use strict';

var webpack = require('webpack'),
    path = require('path'),
    production = process.env.PRODUCTION === 'true';

module.exports = {
  entry: {
    app: path.resolve(__dirname, '../js/app.js')
  },
  output: {
    path: path.resolve(__dirname, '../../dist'),
    filename: 'js/[name].min.js',
    chunkFilename: '/js/[name].chunk.js'
  },
  eslint: {
    configFile: '.eslintrc'
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'eslint',
      exclude: /(node_modules|vendor)/
    }],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }]
  }
};