/** @module cli/webpack-server */
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';
import open from 'opn';

import createDevServerConfig from '../../config/devServer.config';
import program from './parseArgs';
import { removeTrailingSlash } from './utils';

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
    const server = new WebpackDevServer(compiler, createDevServerConfig(huron));
    const prototypeName = huron.prototypes[0].title || huron.prototypes[0];

    server.listen(
      huron.port,
      'localhost',
      (err) => {
        if (err) {
          return console.log(err);
        }

        console.log(`Listening at http://localhost:${huron.port}/`);
        open(`http://localhost:${huron.port}/${
          removeTrailingSlash(huron.root)
        }/${prototypeName}.html`);
        return true;
      }
    );
  }
}
