/** @module cli/parse-arguments */

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
  program.version('1.0.1')
    .option(
      '-c, --huron-config [huronConfig]',
      '[huronConfig] for all huron options',
      path.resolve(__dirname, '../../config/huron.config.js')
    )
    .option(
      '-w, --webpack-config [webpackConfig]',
      '[webpackConfig] for all webpack options',
      path.resolve(__dirname, '../../config/webpack.config.js')
    )
    .option('-p, --production', 'compile assets once for production')
    .parse(process.argv);
}

parseArgs();
