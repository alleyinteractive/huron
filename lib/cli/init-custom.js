'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initCustom;

var _customBundle = require('./custom-bundle.js');

var _customBundle2 = _interopRequireDefault(_customBundle);

var _huron = require('./huron.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Gaze = require('gaze').Gaze; // File watcher

function initCustom() {
  var gaze = new Gaze(_huron.program.custom + '/*.html');

  console.log(_huron.program);

  (0, _customBundle2.default)();

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

    (0, _customBundle2.default)();
  });
}