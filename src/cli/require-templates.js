const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();

export default function requireTemplates(huron, templates, sections) {
  const templateObj = templates._store;
  const templatePathArray = [];
  const templateIds = [];
  const outputPath = path.join(cwd, huron.root);

  // Generate a list of paths and IDs for all templates
  for (let template in templateObj) {
    templatePathArray.push(`'${templateObj[template]}'`);
  };

  // Initialize templates, js, css and HMR acceptance logic
  const prependScript = [
  //   `const sections = JSON.parse(${JSON.stringify(sections._store)});`,
    `export const templates = {};`,
    `export function addCallback(cb) {`,
      `templateReplaceCallback = cb;`,
    `}`,
    `let templateReplaceCallback = null`,
    `if (module.hot) {`,
      `module.hot.accept(`,
        `[${templatePathArray}],`,
        `update => {`,
          `let updatedModules = Object.keys(update);`,
          `if (updatedModules.length) {`,
            `let template = __webpack_require__(update[updatedModules[0]][0]);`,
            `templateReplaceCallback(template);`,
          `}`,
        `}`,
      `);`,
    `}`,
  ];

  // Generate templates object using template IDs as keys
  for (let template in templateObj) {
    prependScript.push(
      `templates['${template}'] = require('${templateObj[template]}');`
    );
  };

  huron.prototypes.forEach(prototype => {
    prependScript.push(
      `templates['prototype-${prototype}'] = require('./${huron.templates}/prototype-${prototype}.html');`
    )
  });

  fs.outputFileSync(
    path.join(outputPath, 'huron-requires.js'),
    prependScript.join('\n')
  );
}