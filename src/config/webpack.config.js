// Requires
const webpack = require('webpack');
const path = require('path');
 /* eslint-disable */
const nodeExternals = require('webpack-node-externals');
const CleanPlugin = require('clean-webpack-plugin');
/* eslint-enable */

module.exports = function getConfig(env) {
  const context = path.join(__dirname, '../../');
  const entry = {};
  let plugins = [];
  let presetEnv = {};

  // Manage entry
  if ('node' === env.target) {
    entry.cli = [];
    if ('dev' === env.process) {
      entry.cli.push('webpack/hot/poll');
    }
    entry.cli = ['./src/cli/huron-cli'];
  } else {
    entry.web = [];
    if ('dev' === env.process) {
      entry.web.push(
        'webpack-dev-server/client?http://localhost:8080/',
        'webpack/hot/dev-server'
      );
    }
    entry.web = ['./src/web/huron'];
  }

  // Manage plugins
  if ('node' === env.target) {
    plugins.push(
      new CleanPlugin(['dist/cli'], {
        root: context,
      })
    );
  }

  if ('dev' === env.process) {
    plugins = plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
    ]);
  }

  // Manage Babel preset env
  if ('node' === env.target) {
    presetEnv = {
      targets: {
        node: 6.5,
      },
    };
  } else {
    presetEnv = {
      targets: {
        browsers: 'last 2 versions',
      },
    };
  }

  return {
    context,
    entry,
    plugins,
    target: env.target,
    devtool: 'cheap-module-source-map',
    output: {
      path: 'node' === env.target ? 'dist/cli' : 'dist/web',
      filename: 'huron-[name].js',
      chunkFilename: '[name].chunk.min.js',
      publicPath: '../',
    },
    externals: ['localConfig', 'localHuron'].concat(nodeExternals()),
    node: {
      __filename: false,
      __dirname: false,
    },
    module: {
      noParse: /get-local-configs/,
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', presetEnv],
              ],
            },
          },
        },
      ],
    },
  };
};
