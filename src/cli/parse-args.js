// Exports
export const program = require('commander'); // Easy program flags

// Requires
const path = require('path');

function processArgs() {
 // Process arguments
  program.version('0.1.0')
    .option(
      '--config [config]',
      '[config] for all huron options',
      path.resolve(__dirname, '../../config/webpack.config.js')
    )
    .option('--production', 'compile assets once for production')
    .parse(process.argv);

  if (!program.config) {
    console.log('No config provided');
    return;
  }
}

processArgs();
