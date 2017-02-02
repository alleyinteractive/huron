// Requires
const webpack = require('webpack');
const path = require('path');
 /* eslint-disable */
const nodeExternals = require('webpack-node-externals');
const CleanPlugin = require('clean-webpack-plugin');
/* eslint-enable */

module.exports = function getConfig(env) {
  const context = path.join(__dirname, '../');
  const entry = ['./src/cli/huron-cli'];
  let plugins = [
    new CleanPlugin(['dist/cli'], {
      root: context,
    }),
  ];

  // Manage entry
  if ('dev' === env.process) {
    entry.cli.unshift('webpack/hot/poll');
  }

  // Manage plugins
  if ('dev' === env.process) {
    plugins = plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    );
  }

  return {
    context,
    entry,
    plugins,
    target: 'node',
    devtool: 'cheap-module-source-map',
    output: {
      path: 'dist/cli',
      filename: 'huron-cli.js',
      chunkFilename: '[name].chunk.min.js',
      publicPath: '../',
    },
    externals: ['localConfig', 'localHuron'].concat(nodeExternals()),
    node: {
      __filename: false,
      __dirname: false,
    },
    module: {
      noParse: /require-external/,
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                ['env', {
                  targets: {
                    node: 4,
                  },
                }],
              ],
            },
          },
        },
      ],
    },
  };
};
