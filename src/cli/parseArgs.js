/** @module cli/parse-arguments */
/* eslint-disable space-unary-ops */
import program from 'commander';
import packageInfo from '../../package.json';

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

  program.version(packageInfo.version)
    .option(
      '-c, --huron-config [huronConfig]',
      '[huronConfig] for all huron options'
    )
    .option(
      '-w, --webpack-config [webpackConfig]',
      '[webpackConfig] for all webpack options'
    )
    .option('-p, --production', 'compile assets once for production')
    .option(
      '--use-prototype [usePrototype]',
      'use only a single prototype in development'
    );

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
