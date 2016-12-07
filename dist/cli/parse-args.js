'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @module cli/parse-arguments */

// Requires
/** @global */
var program = require('commander'); // Easy program flags
var path = require('path');

exports.default = program;

/**
 * Process huron CLI arguments
 *
 * @function parseArgs
 * @example node huron/dist/cli/huron-cli.js --config 'client/config/webpack.config.js' --production
 */

function parseArgs() {
  program.version('0.1.0').option('--config [config]', '[config] for all huron options', path.resolve(__dirname, '../../config/webpack.config.js')).option('--production', 'compile assets once for production').parse(process.argv);

  if (!program.config) {
    console.log('No config provided');
  }
}

parseArgs();