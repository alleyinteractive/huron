/** @module cli/webpack-server */

import program from './parse-args';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk'); // Colorize terminal output

/**
 * Spin up webpack-dev-server or, if production flag is set, run webpack a single time
 *
 * @function startWebpack
 * @param {object} config - webpack configuration, preprocessed by {@link module:cli/generate-config generateConfig}
 * @see {@link module:cli/generate-config generateConfig}
 */
export default function startWebpack(config) {
  const huron = config.huron;
  const webpackConfig = config.webpack;
  const compiler = webpack(webpackConfig);

  if (program.progress) {
    compiler.apply(
      new webpack.ProgressPlugin(
        (percentage, msg) => {
          console.log(`${(percentage * 100)}% `, msg);
        }
      )
    );
  }

  if (program.production) {
    compiler.run((err, stats) => {
      const info = stats.toJson();

      if (err) {
        console.log(err);
      }

      if (stats.hasErrors()) {
        console.error(
          chalk.red(
            'Webpack encountered errors during compile: ',
            info.errors
          )
        );
      }

      if (stats.hasWarnings()) {
        console.error(
          chalk.yellow(
            'Webpack encountered warnings during compile: ', info.warnings
          )
        );
      }
    });
  } else {
    const server = new WebpackDevServer(compiler, {
      hot: true,
      quiet: false,
      noInfo: false,
      stats: {
        colors: true,
        hash: false,
        version: false,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
      },
      contentBase: huron.root,
      publicPath: `http://localhost:${huron.port}/${huron.root}`,
    });
    server.listen(
      huron.port,
      'localhost',
      (err) => {
        if (err) {
          return console.log(err);
        }

        console.log(`Listening at http://localhost:${huron.port}/`);
        return true;
      }
    );
  }
}
