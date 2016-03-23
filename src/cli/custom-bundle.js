const fs = require('fs');
const path = require('path');

import { program } from './huron.js';

export default function bundleCustomPartials() {
	const files = fs.readdirSync(program.custom);
	const bundleName = `${program.custom}/custom-bundle.html`;
	let bundleOutput = fs.createWriteStream(bundleName, 'utf8');

	if (files.length) {
		files.forEach(file => {
			if (file !== 'custom-bundle.html') {
				let data = fs.readFileSync(path.join(program.custom, file));

				if (data) {
					bundleOutput.write(data);
				}
			}
		});
	}
}
