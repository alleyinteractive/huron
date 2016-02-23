'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = bundle;

var _huron = require('./huron.js');

var path = require('path');
var fs = require('fs');

function bundle(combineDir) {
	var partialOutput = '';
	var files = [];

	files = fs.readdirSync(combineDir);
	files.forEach(function (currentPartial) {
		var data = fs.readFileSync(path.join(combineDir, currentPartial));
		if (data) {
			partialOutput += data;
		}
	});

	fs.writeFileSync(_huron.program.destination + '/huron-bundle.html', partialOutput);

	if ('' === partialOutput) {
		console.log('partial bundle is empty! make sure you are properly generating partials');
	}
}