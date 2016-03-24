'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initKSS;

var _huronParseKss = require('./huron-parse-kss.js');

var _huronParseKss2 = _interopRequireDefault(_huronParseKss);

var _huron = require('./huron.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Gaze = require('gaze').Gaze; // File watcher

function initKSS() {
  var gaze = new Gaze(_huron.program.source);

  // Run once no matter what to show most up to date
  (0, _huronParseKss2.default)(gaze.watched());

  gaze.on('error', function (error) {
    console.log('An error has occured: ' + error);
    return;
  });

  gaze.on('nomatch', function () {
    console.log('No matches found');
    return;
  });

  gaze.on('all', function (event, filepath) {
    // Adding/Deleting files
    if (event === 'deleted' || event === 'added') {
      console.log(filepath.substring(_huron.cwd.length) + ' ' + event);
    }

    // Changed on target file
    if (event === 'changed') {
      console.log('Writing partial for ' + filepath);
    }

    (0, _huronParseKss2.default)(gaze.watched());
  });
}