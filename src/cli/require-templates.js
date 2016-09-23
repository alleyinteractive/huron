const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();

export default function requireTemplates(huron, templates, sections) {
  const templateObj = templates._store;
  const templatePathArray = [];
  const templateIds = [];
  const outputPath = path.join(cwd, huron.root);

  // Initialize templates, js, css and HMR acceptance logic
  let prependScript = `export const modules = {};
export const templates = ${JSON.stringify(templateObj)};
export function addCallback(cb) {
  templateReplaceCallback = cb;
}
let templateReplaceCallback = null;
let assets = require.context(
  '${path.join(cwd, huron.root, huron.output)}',
  true,
  /\.(html|json|${huron.templates.extension.replace('.', '')})/
);

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
    path.join(outputPath, 'huron-sections.json'),
    JSON.stringify(sections._store)
  );
}

