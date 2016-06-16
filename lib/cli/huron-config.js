'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = processArgs;

var _huron = require('./huron.js');

function processArgs() {
  _huron.program.version('0.0.1').option('--source [kss]', '[source] of kss documentation to convert').option('--destination [destination]', '[destination] of partial output', function (dest) {
    return [_huron.cwd, dest].join('/');
  }).option('--custom [custom]', 'location of user-generated [custom] partials', function (custom) {
    return [_huron.cwd, custom].join('/');
  }).option('--bundle', 'bundle partials into a single file').option('--bundle-name [bundleName]', 'name of bundle', 'huron').option('-r, --root [root]', '[root] directory for the server, defaults to current working directory', _huron.cwd).option('--port [port]', '[port] to listen the server on', function (port) {
    return parseInt(port);
  }, 8080).option('-o, --output', 'Verbose output of options').option('--runOnce', 'Run only once, without watching').parse(process.argv);

  if (!_huron.program.source) {
    console.log('No KSS source given');
    return;
  }

  if (!_huron.program.destination) {
    console.log('No output destination given');
    return;
  }
}