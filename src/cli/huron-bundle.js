import { program } from './huron.js';

const path = require('path');
const fs = require('fs');

export default function bundle(combineDir) {
	let output = fs.createWriteStream(`${program.destination}/huron-bundle.html`, 'utf8');
	let files = [];
	let data = '';

	files = fs.readdirSync(combineDir);
	files.forEach(currentPartial => {
		data = fs.readFileSync(path.join(combineDir, currentPartial), 'utf8');
		output.write(data, 'utf8');
	});
}