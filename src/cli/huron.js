// CLI for Huron

// Modules
const cwd = process.cwd(); // Current working directory
const kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
const path = require('path');
const fs = require('fs-extra');
const Gaze = require('gaze').Gaze;
const memStore = require('memory-store');

// Local imports
import { program } from './parse-args';
import { initFiles, updateFile, deleteFile } from './actions';
import generateConfig from './generate-config';
import requireTemplates from './require-templates';
import startWebpack from './server';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const config = generateConfig(localConfig);
const huron = config.huron; // huron config
const sections = memStore.createStore();
const templates = memStore.createStore();
const huronScript = fs.readFileSync(path.resolve(__dirname, '../js/huron.js'), 'utf8');
const extenstions = [
  huron.kssExt,
  '.html',
  '.handlebars',
  '.hbs',
  '.json'
];

// Move huron script into huron roon
fs.writeFileSync(path.join(cwd, huron.root, 'huron.js'), huronScript);

// Generate watch list for Gaze, start gaze
const gazeWatch = [];
extenstions.forEach(ext => {
  gazeWatch.push(`${huron.kss}/**/*${ext}`);
});
const gaze = new Gaze(gazeWatch);

// Initialize all files watched by gaze
initFiles(gaze.watched(), sections, templates, huron)
  .then(() => {
    requireTemplates(huron, templates, sections);

    if (!program.production) {
      // file changed
      gaze.on('changed', (filepath) => {
        const file = path.parse(filepath);
        updateFile(filepath, sections, templates, huron)
          .then(
            (sectionURI) => {
              console.log(`${filepath} updated!`);
            },
            (error) => {
              console.log(error);
            }
          );
      });

      // file added
      gaze.on('added', (filepath) => {
        updateFile(filepath, sections, templates, huron)
          .then(
            (sectionURI) => {
              requireTemplates(huron, templates, sections);
              console.log(`${filepath} added!`);
            },
            (error) => {
              console.log(error);
            }
          );
      });

      // file renamed
      gaze.on('renamed', (newPath, oldPath) => {
        deleteFile(oldPath, sections, templates, huron);
        updateFile(newPath, sections, templates, huron)
          .then(
            (sectionURI) => {
              requireTemplates(huron, templates, sections);
              console.log(`${newPath} added!`);
            },
            (error) => {
              console.log(error);
            }
          );
      });

      // file deleted
      gaze.on('deleted', (filepath) => {
        deleteFile(filepath, sections, templates, huron);
        requireTemplates(huron, templates, sections);
        console.log(`${filepath} deleted`);
      });
    } else {
      gaze.close();
    }

    // Start webpack or build for production
    startWebpack(config);
  });


