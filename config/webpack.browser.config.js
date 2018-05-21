// Requires
const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: path.join(__dirname, '../'),
  entry: {
    web: ['./src/web/index'],
  },
  devtool: 'cheap-module-source-map',
  optimization: {
    namedModules: true, // NamedModulesPlugin()
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
  ],
  output: {
    path: path.join(__dirname, '../dist/web'),
    filename: 'index.js',
    chunkFilename: '[name].chunk.min.js',
    publicPath: '../',
    library: 'huron',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: [/\.min\.js$/],
        use: 'eslint-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
};
