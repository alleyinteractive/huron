import { program } from './huron.js';

const path = require('path');
const fs = require('fs');

export default function bundle(combineDir) {
	let partialOutput = '';
	let files = [];

	files = fs.readdirSync(combineDir);
	files.forEach((currentPartial) => {
		let data = fs.readFileSync(path.join(combineDir, currentPartial));
		if (data) {
			partialOutput += data;
		}
	});

	fs.writeFileSync(`${program.destination}/huron-bundle.html`, partialOutput);

	if ('' === partialOutput) {
		console.log('partial bundle is empty! make sure you are properly generating partials');
	}
}