var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: {
    huron: [path.resolve(__dirname, '../src/js/huron.js')],
  },
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: 'js/[name].min.js',
    chunkFilename: '/js/[name].chunk.min.js'
  },
  eslint: {
    configFile: path.resolve(__dirname, './.eslintrc')
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: /(node_modules|vendor)/
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel!huron',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader:'style-loader!css'
      },
    ]
  }
};
