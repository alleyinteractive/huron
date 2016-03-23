'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = bundleCustomPartials;

var _huron = require('./huron.js');

var fs = require('fs');
var path = require('path');

function bundleCustomPartials() {
	var files = fs.readdirSync(_huron.program.custom);
	var bundleName = _huron.program.custom + '/custom-bundle.html';
	var bundleOutput = fs.createWriteStream(bundleName, 'utf8');

	if (files.length) {
		files.forEach(function (file) {
			if (file !== 'custom-bundle.html') {
				var data = fs.readFileSync(path.join(_huron.program.custom, file));

				if (data) {
					bundleOutput.write(data);
				}
			}
		});
	}
}