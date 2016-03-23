import kssTraverse from './huron-parse-kss.js';
import { program, cwd } from './huron.js';

const Gaze = require('gaze').Gaze; // File watcher

export default function initKSS() {
	const gaze = new Gaze(program.source);

  // Run once no matter what to show most up to date
  kssTraverse(gaze.watched());

  gaze.on('error', (error) => {
    console.log(`An error has occured: ${error}`);
    return;
  });

  gaze.on('nomatch', () => {
    console.log('No matches found');
    return;
  });

  gaze.on('all', (event, filepath) => {
    // Adding/Deleting files
    if (event === 'deleted' || event === 'added') {
      console.log(`${filepath.substring(cwd.length)} ${event}`);
    }

    // Changed on target file
    if (event === 'changed') {
      console.log(`Writing partial for ${filepath}`);
    }

    kssTraverse(gaze.watched());
  });
}