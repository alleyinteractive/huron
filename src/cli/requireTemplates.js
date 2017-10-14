/** @module cli/require-templates */

import path from 'path';
import fs from 'fs-extra';

const cwd = process.cwd();
const huronScript = fs.readFileSync(
  path.join(__dirname, '../web/index.js'),
  'utf8'
);

/**
 * Write code for requiring all generated huron assets
 * Note: prepended and appended code in this file should roughly follow es5 syntax for now,
 *  as it will not pass through the Huron internal babel build nor can we assume the user is
 *  working with babel.
 *
 * @function requireTemplates
 * @param {object} store - memory store
 */
export const requireTemplates = function requireTemplates(store) {
  const huron = store.get('config');
  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');
  const requireRegex = new RegExp(`\\.html|\\.json|\\${
    huron.get('templates').extension
  }$`);
  const requirePath = `'../${huron.get('output')}'`;

  // Initialize templates, js, css and Hot Module Replacement acceptance logic
  const hotTemplate = `
var store = require('./huron-store');
var InsertNodes = require('./insertNodes').default;
var sectionTemplate = require('./section.hbs');
var assets = require.context(${requirePath}, true, ${requireRegex});
var modules = {};

modules['${store.get('sectionTemplatePath')}'] = sectionTemplate;

assets.keys().forEach(function(key) {
  modules[key] = assets(key);
});

var insert = window.insert ? window.insert :
  new InsertNodes(modules, store);
window.insert = insert;

if (module.hot) {
  // Hot Module Replacement for huron components (json, hbs, html)
  module.hot.accept(
    assets.id,
    () => {
      var newAssets = require.context(
        ${requirePath},
        true,
        ${requireRegex}
      );
      var newModules = newAssets.keys()
        .map((key) => {
          return [key, newAssets(key)];
        })
        .filter((newModule) => {
          return modules[newModule[0]] !== newModule[1];
        });

      updateStore(require('./huron-store.js'));

      newModules.forEach((module) => {
        modules[module[0]] = module[1];
        hotReplace(module[0], module[1], modules);
      });
    }
  );

  // Hot Module Replacement for sections template
  module.hot.accept(
    './section.hbs',
    () => {
      var newSectionTemplate = require('./section.hbs');
      modules['${store.get('sectionTemplatePath')}'] = newSectionTemplate;
      hotReplace(
        './huron-assets/section.hbs',
        newSectionTemplate,
        modules
      );
    }
  );

  // Hot Module Replacement for data store
  module.hot.accept(
    './huron-store.js',
    () => {
      updateStore(require('./huron-store.js'));
    }
  );
}

function hotReplace(key, module, modules) {
  insert.modules = modules;
  if (key === store.sectionTemplatePath) {
    insert.cycleSections();
  } else {
    insert.inserted = [];
    insert.loadModule(key, module, false);
  }
};

function updateStore(newStore) {
  insert.store = newStore;
}\n`;

  // Write the contents of this script.
  // @todo lint this file.
  fs.outputFileSync(
    path.join(outputPath, 'index.js'),
    `/*eslint-disable*/\n
${hotTemplate}\n\n
/*eslint-enable*/\n`
  );
  fs.outputFileSync(
    path.join(outputPath, 'insertNodes.js'),
    huronScript
  );
};

/**
 * Output entire data store to a JS object and handle if any KSS data has changed
 *
 * @function writeStore
 * @param {object} store - memory store
 * @param {string} changed - filepath of changed KSS section, if applicable
 */
export const writeStore = function writeStore(store, newStore = false) {
  const updatedStore = newStore || store;
  const huron = updatedStore.get('config');
  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');

  // Write updated data store
  // @todo lint this file.
  fs.outputFileSync(
    path.join(outputPath, 'huron-store.js'),
    `/*eslint-disable*/
    module.exports = ${JSON.stringify(updatedStore.toJSON())}
    /*eslint-disable*/\n`
  );
};

