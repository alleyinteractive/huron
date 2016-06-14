var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: {
    test: [
      path.resolve(__dirname, '../src/js/test.js')
    ],
  },
  eslint: {
    configFile: path.resolve(__dirname, './.eslintrc')
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
    ]
  }
};
