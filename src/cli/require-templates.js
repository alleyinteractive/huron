const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();

import { storeCb } from './store-callback';

export default function requireTemplates(store) {
  const templates = store.get('templates', storeCb);
  const sections = store.get('sections', storeCb);
  const huron = store.get('config', storeCb);
  const templateObj = templates._store;
  const templatePathArray = [];
  const templateIds = [];
  const outputPath = path.join(cwd, huron.root);

  // Initialize templates, js, css and HMR acceptance logic
  let prependScript = `
let templateReplaceCallback = null;
let assets = require.context(
  '${path.join(cwd, huron.root, huron.output)}',
  true,
  /\.(html|json|${huron.templates.extension.replace('.', '')})/
);

export function addCallback(cb) {
  templateReplaceCallback = cb;
}
export const modules = {};
export const templates = ${JSON.stringify(templateObj)};
export const sections = assets('./huron-sections/sections.json');

assets.keys().forEach(function(key) {
  modules[key] = assets(key);
});

if (module.hot) {
  module.hot.accept(
    assets.id,
    () => {
      const newAssets = require.context(
        '${path.join(cwd, huron.root, huron.output)}',
        true,
        /\.(html|json|${huron.templates.extension.replace('.', '')})/
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
        templateReplaceCallback(module[0], module[1], modules, templates);
      });
    }
  );
}\n`

  // Write the contents of thsi script.
  fs.outputFileSync(
    path.join(outputPath, 'huron-requires.js'),
    prependScript
  );

  // Save the sections information to a JSON file.
  fs.outputFileSync(
    path.join(outputPath, huron.output, 'huron-sections/sections.json'),
    JSON.stringify(sections._store)
  );
}

