const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();
const huronScript = fs.readFileSync(path.resolve(__dirname, '../js/huron.js'), 'utf8');

export const requireTemplates = function(store) {
  const huron = store.get('config');
  const templatePathArray = [];
  const templateIds = [];
  const outputPath = path.join(cwd, huron.get('root'));

  // Initialize templates, js, css and HMR acceptance logic
  const prepend = `
let huronData = require('./huron-store.js');
let store = huronData.store;
let changed = huronData.changed;

let assets = require.context(
  '${path.join(cwd, huron.get('root'), huron.get('output'))}',
  true,
  /\.(html|json|${huron.get('templates').extension.replace('.', '')})/
);
const modules = {};

assets.keys().forEach(function(key) {
  modules[key] = assets(key);
});

if (module.hot) {
  module.hot.accept(
    assets.id,
    () => {
      const newAssets = require.context(
        '${path.join(cwd, huron.get('root'), huron.get('output'))}',
        true,
        /\.(html|json|${huron.get('templates').extension.replace('.', '')})/
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
        hotReplace(module[0], module[1], modules, store);
      });
    }
  );

  module.hot.accept(
    './huron-store.js',
    () => {
      updateStore(require('./huron-store.js'));
    }
  );
}\n`

  const append = `
  function hotReplace(key, module, modules, store) {
    insert.store = store;
    insert.modules = modules;
    insert.loadModule(key, module);
  }

  function updateStore(data) {
    store = data.store;
    changed = data.changed;
    insert.store = store;

    if (changed) {
      insert.updateChangedSection(changed);
    }
  }
  `

  // Write the contents of thsi script.
  fs.outputFileSync(
    path.join(outputPath, 'huron.js'),
    `${prepend}\n\n${huronScript}\n\n${append}`
  );
}

/**
 * Output entire data store to a JS object and handle if any KSS data has changed
 *
 * @param {object} store - memory store
 * @param {string} changed - filepath of changed KSS section, if applicable
 */
export const writeStore = function(store, changed = false) {
  const huron = store.get('config');
  const outputPath = path.join(cwd, huron.get('root'));

  // Write updated data store
  fs.outputFileSync(
    path.join(outputPath, 'huron-store.js'),
    `module.exports.store = ${JSON.stringify(store.toJSON())}
    module.exports.changed = '${changed}'\n`
  );
}

