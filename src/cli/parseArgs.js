/** @module cli/parse-arguments */
/* eslint-disable space-unary-ops */

import program from 'commander';
import path from 'path';

// Requires
/** @global */

/**
 * Process huron CLI arguments
 *
 * @function parseArgs
 * @example node huron/dist/cli/huron-cli.js --config 'client/config/webpack.config.js' --production
 */
function parseArgs() {
  const envArg = {};

  process.argv = process.argv.filter((arg) => {
    if (-1 !== arg.indexOf('--env')) {
      const envParts = arg
        .split('.')[1]
        .split('=');

      envArg[envParts[0]] = envParts[1] || true;
      return false;
    }

    return true;
  });

  program.version('1.0.1')
    .option(
      '-c, --huron-config [huronConfig]',
      '[huronConfig] for all huron options',
      path.resolve(__dirname, '../default-config/huron.config.js')
    )
    .option(
      '-w, --webpack-config [webpackConfig]',
      '[webpackConfig] for all webpack options',
      path.resolve(__dirname, '../default-config/webpack.config.js')
    )
    .option('-p, --production', 'compile assets once for production');

  program.env = envArg;

  // Only parse if we're not running tests
  if (
    ! process.env.npm_lifecycle_event ||
    'test' !== process.env.npm_lifecycle_event
  ) {
    program.parse(process.argv);
  }
}

parseArgs();
/* eslint-enable */

export default program;
