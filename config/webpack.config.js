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
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
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
