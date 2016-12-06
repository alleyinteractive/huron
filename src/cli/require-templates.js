/** @module cli/require-templates */

const path = require('path');
const fs = require('fs-extra');

const cwd = process.cwd();
const huronScript = fs.readFileSync(
  path.resolve(__dirname, '../web/huron.js'),
  'utf8'
);

/**
 * Write code for requiring all generated huron assets
 *
 * @param {object} store - memory store
 */
export const requireTemplates = function requireTemplates(store) {
  const huron = store.get('config');
  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');
  const requireRegex = new RegExp(`\\.html|\\.json|\\${
    huron.get('templates').extension
  }$`);
  const requirePath = `'../${huron.get('output')}'`;

  // Initialize templates, js, css and HMR acceptance logic
  const prepend = `
let store = require('./huron-store.js');
const assets = require.context(${requirePath}, true, ${requireRegex});
const modules = {};

assets.keys().forEach(function(key) {
  modules[key] = assets(key);
});

if (module.hot) {
  module.hot.accept(
    assets.id,
    () => {
      const newAssets = require.context(
        ${requirePath},
        true,
        ${requireRegex}
      );
      const newModules = newAssets.keys()
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

  module.hot.accept(
    './huron-store.js',
    () => {
      updateStore(require('./huron-store.js'));
    }
  );
}\n`;

  const append = `
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
    path.join(outputPath, 'huron.js'),
    `/*eslint-disable*/\n
${prepend}\n\n${huronScript}\n\n${append}\n
/*eslint-enable*/\n`
  );
};

/**
 * Output entire data store to a JS object and handle if any KSS data has changed
 *
 * @param {object} store - memory store
 * @param {string} changed - filepath of changed KSS section, if applicable
 */
export const writeStore = function writeStore(store) {
  const huron = store.get('config');
  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');

  // Write updated data store
  // @todo lint this file.
  fs.outputFileSync(
    path.join(outputPath, 'huron-store.js'),
    `/*eslint-disable*/
    module.exports = ${JSON.stringify(store.toJSON())}
    /*eslint-disable*/\n`
  );
};

