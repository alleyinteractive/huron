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
import { store, changed } from './huron-store.js';

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

      newModules.forEach((module) => {
        modules[module[0]] = module[1];
        hotReplace(module[0], module[1], modules, store);
      });
    }
  );

  module.hot.accept(
    '${path.join(outputPath, 'huron-store.js')}',
    () => {
      if (changed) {
        insert.updateChangedSection(changed);
      }
    }
  );
}\n`

  const append = `
  function hotReplace(key, module, modules, store) {
    insert.store = store;
    insert.modules = modules;
    insert.reloadModule(key, module);
  }`

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
export const writeStore = function(store, changed) {
  const huron = store.get('config');
  const outputPath = path.join(cwd, huron.get('root'));

  // Write updated data store
  fs.outputFileSync(
    path.join(outputPath, 'huron-store.js'),
    `export const store = ${JSON.stringify(store.toJSON())}
    export const changed = ${changed}\n`
  );
}

