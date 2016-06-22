const path = require('path');
const fs = require('fs');
const cwd = process.cwd();

export default function requireTemplates(huron, templates) {
  const templateObj = templates._store;
  const templatePathArray = [];
  const templateIds = [];
  const huronScript = fs.readFileSync(path.resolve(__dirname, '../js/huron.js'), 'utf8');
  const outputPath = path.join(cwd, huron.root);

  try {
    fs.accessSync(outputPath, fs.F_OK);
  } catch (e) {
    fs.mkdirSync(outputPath);
  }

  // Generate a list of paths and IDs for all templates
  for (let template in templateObj) {
    templatePathArray.push(`'${templateObj[template]}'`);
    templateIds.push(template);
  };

  // Initialize templates, js, css and HMR acceptance logic
  const prependScript = [
    `const templates = {};`,
    `const css = []`,
    `const js = []`,
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
  templatePathArray.forEach((template, idx) => {
    prependScript.push(
      `templates['${templateIds[idx]}'] = require(${template});`
    );
  });

  // Add extra CSS
  if (huron.css && huron.css.length) {
    huron.css.forEach((css) => {
      prependScript.push(
        `css.push(require('${path.join(huron.root, css)}'));`
      )
    });
  }

  // Add extra JS
  if (huron.js && huron.js.length) {
    huron.js.forEach((js) => {
      prependScript.push(
        `js.push(require('${path.join(huron.root, js)}'));`
      )
    });
  }

  fs.writeFileSync(
    path.join(outputPath, 'huron.js'),
    [
      prependScript.join('\n'),
      huronScript,
    ].join('\n')
  );
}