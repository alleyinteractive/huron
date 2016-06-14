var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: {
    huron: [
      path.resolve(__dirname, '../src/js/huron.js')
    ],
  },
  output: {
    path: '/dist',
    filename: '[name].js',
    chunkFilename: '[name].chunk.min.js'
  },
  eslint: {
    configFile: path.resolve(__dirname, './.eslintrc')
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
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
        test: /huron.js$/,
        loader: 'babel!huron',
      },
      {
        test: /\.css$/,
        loader:'style-loader!css'
      },
      {
        test: /\.html?$/,
        loader: 'dom!html'
      }
    ]
  }
};
