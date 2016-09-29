const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();

export default function requireTemplates(store) {
  const huron = store.get('config');
  const templatePathArray = [];
  const templateIds = [];
  const outputPath = path.join(cwd, huron.get('root'));

  // Initialize templates, js, css and HMR acceptance logic
  let prependScript = `
let templateReplaceCallback = null;
let assets = require.context(
  '${path.join(cwd, huron.get('root'), huron.get('output'))}',
  true,
  /\.(html|json|${huron.get('templates').extension.replace('.', '')})/
);

export function addCallback(cb) {
  templateReplaceCallback = cb;
}
export const modules = {};
export const templates = ${JSON.stringify(store.get('templates').toJSON())};
export const sections = assets('./huron-sections/sections.json');

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
    path.join(outputPath, huron.get('output'), 'huron-sections/sections.json'),
    JSON.stringify(store.get('sections').toJSON())
  );
}

