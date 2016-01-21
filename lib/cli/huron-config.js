'use strict';

module.exports = function processArgs(program, process, cwd) {
  program.version('0.0.1').option('--source [kss]', '[source] of kss documentation to convert').option('--destination [destination]', '[destination] of partial output', function (dest) {
    return [cwd, dest].join('/');
  }).option('-r, --root [root]', '[root] directory for the server, defaults to current working directory', cwd).option('--port [port]', '[port] to listen the server on', function (port) {
    return parseInt(port);
  }, 8080).option('-o, --output', 'Verbose output of options').option('--runOnce', 'Run only once, without watching').parse(process.argv);

  if (!program.source) {
    console.log('No KSS source given');
    return;
  }

  if (!program.destination) {
    console.log('No output destination given');
    return;
  }
};