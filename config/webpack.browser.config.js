// Requires
const webpack = require('webpack');
const path = require('path');

module.exports = function getConfig(env) {
  const context = path.join(__dirname, '../');

  return {
    context,
    entry: {
      web: ['./src/web/index'],
    },
    devtool: 'cheap-module-source-map',
    plugins: [
      new webpack.NamedModulesPlugin(),
    ],
    output: {
      path: path.join(context, 'dist/web'),
      filename: 'index.js',
      chunkFilename: '[name].chunk.min.js',
      publicPath: '../',
      library: 'huron',
      libraryTarget: 'commonjs2',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
      ],
    },
  };
};
