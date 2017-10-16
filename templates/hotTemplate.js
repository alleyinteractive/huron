/* globals hotScope */

// NOTE: This is not a normal JS file! It is pulled in by the CLI as a string
// and prepended to the browser script after replacing anything referenced via `hotScope[variable]`
// with CLI arguments or config properties passed in by the user.

/* eslint-disable */
import store from './huron-store';
import InsertNodes from './insertNodes';
import sectionTemplate from './section.hbs';
/* eslint-enable */

const assets = require.context(
    hotScope.requirePath,
    true,
    hotScope.requireRegex
  );
const modules = {};

modules[hotScope.sectionTemplatePath] = sectionTemplate;

assets.keys().forEach((key) => {
  modules[key] = assets(key);
});

const insert = new InsertNodes(modules, store);

if (module.hot) {
  // Hot Module Replacement for huron components (json, hbs, html)
  module.hot.accept(
    assets.id,
    () => {
      const newAssets = require.context(
        hotScope.requirePath,
        true,
        hotScope.requireRegex
      );
      const newModules = newAssets.keys()
        .map((key) => [key, newAssets(key)])
        .filter((newModule) => modules[newModule[0]] !== newModule[1]);

      updateStore(require('./huron-store.js')); // eslint-disable-line global-require, import/no-unresolved
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
      const newSectionTemplate = require('./section.hbs'); // eslint-disable-line global-require, import/no-unresolved

      modules[hotScope.sectionTemplatePath] = newSectionTemplate;
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
      updateStore(require('./huron-store.js')); // eslint-disable-line global-require, import/no-unresolved
    }
  );
}

function hotReplace(key, module, newModules) {
  insert.modules = newModules;
  if (key === store.sectionTemplatePath) {
    insert.cycleSections();
  } else {
    insert.inserted = [];
    insert.loadModule(key, module, false);
  }
}

function updateStore(newStore) {
  insert.store = newStore;
}
