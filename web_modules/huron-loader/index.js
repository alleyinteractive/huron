// Huron loader
//
// Performs one simple function:
// inserting static paths so webpack can statically analyze html templates and source CSS

var path = require('path');
var fs = require('fs');
var cwd = process.cwd();

module.exports = function(source, map) {
  var huron = this.options.huron;
  var templatePathArray = [];
  var templateIds = [];

  // Read the templates dir
  var templates = fs.readdirSync(path.join(huron.root, huron.templates));

  // Generate a list of paths and IDs for all templates
  templates.forEach(file => {
    if (file.indexOf('.html') >= 0) {
      templatePathArray.push(
        `'${path.resolve(cwd, huron.root, huron.templates, file)}'`
      );
      templateIds.push(file.replace('.html', ''));
    }
  });

  // Initialize templates, js, css and HMR acceptance logic
  var prependScript = [
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

  if (huron.css && huron.css.length) {
    huron.css.forEach((css) => {
      prependScript.push(
        `css.push(require('${path.join(rootPath, css)}'));`
      )
    });
  }

  return [
    prependScript.join('\n'),
    source
  ].join('\n');
}