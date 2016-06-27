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
import { initFiles, updateSection, updateFile } from './actions';
import generateConfig from './generate-config';
import requireTemplates from './require-templates';
import startWebpack from './server';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const config = generateConfig(localConfig);
const huron = config.huron; // huron config
const sections = memStore.createStore();
const templates = memStore.createStore();
const extenstions = [
  huron.kssExt,
  '.html',
  '.handlebars',
  '.hbs',
  '.json'
];

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
        updateFile(filepath, sections, templates, huron);
      });

      // file added
      gaze.on('added', (filepath) => {
        updateFile(filepath, sections, templates, huron)
          .then(
            (sectionURI) => {
              requireTemplates(huron, templates, sections);
              console.log(`Section ${sectionURI} added!`);
            },
            (error) => {
              console.log(error);
            }
          );
      });

      // file renamed
      gaze.on('renamed', (newPath, oldPath) => {
        updateFile(newPath, sections, templates, huron)
          .then(
            (sectionURI) => {
              requireTemplates(huron, templates, sections);
              console.log(`Section ${sectionURI} added!`);
            },
            (error) => {
              console.log(error);
            }
          );
      });

      // file deleted
      gaze.on('deleted', (filepath) => {
        // TODO: Add logic to remove output HTML
        requireTemplates(huron, templates, sections);
      });
    } else {
      gaze.close();
    }

    // Start webpack or build for production
    startWebpack(config);
  });


