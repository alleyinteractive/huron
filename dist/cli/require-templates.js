'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @module cli/require-templates */

var path = require('path');
var fs = require('fs-extra');

var cwd = process.cwd();
var huronScript = fs.readFileSync(path.resolve(__dirname, '../web/huron.js'), 'utf8');

/**
 * Write code for requiring all generated huron assets
 *
 * @function requireTemplates
 * @param {object} store - memory store
 */
var requireTemplates = exports.requireTemplates = function requireTemplates(store) {
  var huron = store.get('config');
  var outputPath = path.join(cwd, huron.get('root'), 'huron-assets');
  var requireRegex = new RegExp('\\.html|\\.json|\\' + huron.get('templates').extension + '$');
  var requirePath = '\'../' + huron.get('output') + '\'';

  // Initialize templates, js, css and HMR acceptance logic
  var prepend = '\nlet store = require(\'./huron-store.js\');\nconst assets = require.context(' + requirePath + ', true, ' + requireRegex + ');\nconst modules = {};\n\nassets.keys().forEach(function(key) {\n  modules[key] = assets(key);\n});\n\nif (module.hot) {\n  module.hot.accept(\n    assets.id,\n    () => {\n      const newAssets = require.context(\n        ' + requirePath + ',\n        true,\n        ' + requireRegex + '\n      );\n      const newModules = newAssets.keys()\n        .map((key) => {\n          return [key, newAssets(key)];\n        })\n        .filter((newModule) => {\n          return modules[newModule[0]] !== newModule[1];\n        });\n\n      updateStore(require(\'./huron-store.js\'));\n\n      newModules.forEach((module) => {\n        modules[module[0]] = module[1];\n        hotReplace(module[0], module[1], modules);\n      });\n    }\n  );\n\n  module.hot.accept(\n    \'./huron-store.js\',\n    () => {\n      updateStore(require(\'./huron-store.js\'));\n    }\n  );\n}\n';

  var append = '\nfunction hotReplace(key, module, modules) {\n  insert.modules = modules;\n  if (key === store.sectionTemplatePath) {\n    insert.cycleSections();\n  } else {\n    insert.inserted = [];\n    insert.loadModule(key, module, false);\n  }\n};\n\nfunction updateStore(newStore) {\n  insert.store = newStore;\n}\n';

  // Write the contents of this script.
  // @todo lint this file.
  fs.outputFileSync(path.join(outputPath, 'huron.js'), '/*eslint-disable*/\n\n' + prepend + '\n\n' + huronScript + '\n\n' + append + '\n\n/*eslint-enable*/\n');
};

/**
 * Output entire data store to a JS object and handle if any KSS data has changed
 *
 * @function writeStore
 * @param {object} store - memory store
 * @param {string} changed - filepath of changed KSS section, if applicable
 */
var writeStore = exports.writeStore = function writeStore(store) {
  var huron = store.get('config');
  var outputPath = path.join(cwd, huron.get('root'), 'huron-assets');

  // Write updated data store
  // @todo lint this file.
  fs.outputFileSync(path.join(outputPath, 'huron-store.js'), '/*eslint-disable*/\n    module.exports = ' + JSON.stringify(store.toJSON()) + '\n    /*eslint-disable*/\n');
};