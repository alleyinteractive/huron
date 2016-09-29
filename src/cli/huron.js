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
import { storeCb } from './store-callback';
import generateConfig from './generate-config';
import requireTemplates from './require-templates';
import startWebpack from './server';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const config = generateConfig(localConfig);
const huron = config.huron;
const huronScript = fs.readFileSync(path.resolve(__dirname, '../js/huron.js'), 'utf8');
const sectionTemplate = fs.readFileSync(path.resolve(__dirname, '../../templates/section.hbs'), 'utf8');
const extenstions = [
  huron.kssExtension,
  '.html',
  '.handlebars',
  '.hbs',
  '.json'
];

/* Create global memory store
 *
 * Sample structure:
 * {
 *  _store: {
 *    sections: {
 *      sectionsByPath: {}, Sections listed with path to file containing KSS as keys
 *      sorted: {}, Hierarchical representation of sections
 *    },
 *    templates: {
 *      templatesByPath: {}, List of corresponding information by path fo file containing KSS
 *      templateDataPairs: {}, pairs of relative paths to templates and data (relative to configured output path)
 *    },
 *    config: {...}, Huron configuration
 *  }
 * }
 */
const store = memStore.createStore();

// Init primary store fields
// @todo move to separate file/function
store.set('config', config.huron, storeCb);
store.set('sections', memStore.createStore(), storeCb);
store.set('templates', memStore.createStore(), storeCb);

// Move huron script and section template into huron root
// @todo move to separate file/function
fs.outputFileSync(path.join(cwd, huron.root, 'huron.js'), huronScript);
fs.outputFileSync(
  path.join(cwd, huron.root, huron.output, 'huron-sections/sections.hbs'),
  sectionTemplate
);

// Generate watch list for Gaze, start gaze
const gazeWatch = [];
extenstions.forEach(ext => {
  gazeWatch.push(`${huron.kss}/**/*${ext}`);
});
const gaze = new Gaze(gazeWatch);

// Initialize all files watched by gaze
initFiles(gaze.watched(), store)
  .then(() => {
    requireTemplates(store);

    console.log(store._store.templates._store);

    if (!program.production) {
      // file changed
      gaze.on('changed', (filepath) => {
        const file = path.parse(filepath);
        updateFile(filepath, store)
          .then(
            (sectionURI) => {
              console.log(`${filepath} updated!`);
            },
            (error) => {
              console.error('changed', error);
            }
          );

        console.log(store._store.templates._store);
      });

      // file added
      gaze.on('added', (filepath) => {
        updateFile(filepath, store)
          .then(
            (sectionURI) => {
              requireTemplates(store);
              console.log(`${filepath} added!`);
            },
            (error) => {
              console.error('update', error);
            }
          );

        console.log(store._store.templates._store);
      });

      // file renamed
      gaze.on('renamed', (newPath, oldPath) => {
        deleteFile(oldPath, store);
        updateFile(newPath, store)
          .then(
            (sectionURI) => {
              requireTemplates(store);
              console.log(`${newPath} added!`);
            },
            (error) => {
              console.error('renamed', error);
            }
          );

        console.log(store._store.templates._store);
      });

      // file deleted
      gaze.on('deleted', (filepath) => {
        deleteFile(filepath, store);
        requireTemplates(store);
        console.log(`${filepath} deleted`);

        console.log(store._store.templates._store);
      });
    } else {
      gaze.close();
    }

    // Start webpack or build for production
    // startWebpack(config);
  });


