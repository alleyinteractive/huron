'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = bundle;

var _huron = require('./huron.js');

var path = require('path');
var fs = require('fs');

function bundle(combineDir) {
	var output = fs.createWriteStream(_huron.program.destination + '/huron-bundle.html', 'utf8');
	var files = [];
	var data = '';

	files = fs.readdirSync(combineDir);
	files.forEach(function (currentPartial) {
		data = fs.readFileSync(path.join(combineDir, currentPartial), 'utf8');
		output.write(data, 'utf8');
	});
}