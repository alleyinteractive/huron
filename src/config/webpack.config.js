// Requires
const webpack = require('webpack');
const path = require('path');
 /* eslint-disable */
const nodeExternals = require('webpack-node-externals');
const CleanPlugin = require('clean-webpack-plugin');
/* eslint-enable */

// Paths
const buildRoot = path.resolve(__dirname, '../../');
const sourceRoot = path.join(buildRoot, 'src');

module.exports = function getConfig(env) {
  const entry = {};
  let plugins = [];
  let presetEnv = {};

  // Manage entry
  if ('node' === env.target) {
    entry.cli = [];
    if ('dev' === env.process) {
      entry.cli.push('webpack/hot/poll');
    }
    entry.cli = [path.join(sourceRoot, 'cli/huron-cli.js')];
  } else {
    entry.web = [];
    if ('dev' === env.process) {
      entry.web.push(
        'webpack-dev-server/client?http://localhost:8080/',
        'webpack/hot/dev-server'
      );
    }
    entry.web = [path.join(sourceRoot, 'web/huron.js')];
  }

  // Manage plugins
  if ('node' === env.target) {
    plugins.push(
      new CleanPlugin(['dist/cli'], {
        root: buildRoot,
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
    target: env.target,
    entry,
    plugins,
    output: {
      path: 'node' === env.target ?
        path.join(buildRoot, 'dist/cli') :
        path.join(buildRoot, 'dist/web'),
      filename: 'huron-[name].js',
      chunkFilename: '[name].chunk.min.js',
      publicPath: '../',
    },
    externals: [nodeExternals()],
    node: {
      __filename: false,
      __dirname: false,
    },
    module: {
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
