/** @module cli/parse-arguments */
/* eslint-disable space-unary-ops */

// Requires
/** @global */
const program = require('commander'); // Easy program flags
const path = require('path');

export default program;

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
    .option('-p, --production', 'compile assets once for production')
    .parse(process.argv);

  program.env = envArg;
}

parseArgs();
/* eslint-enable */
