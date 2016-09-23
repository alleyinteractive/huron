const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();

export default function requireTemplates(huron, templates, sections) {
  const templateObj = templates._store;
  const templatePathArray = [];
  const templateIds = [];
  const outputPath = path.join(cwd, huron.root);

  // Add the prototypes to the template array
  // These are copied from the huron.kss directory
  huron.prototypes.forEach(prototype => {
    templateObj[`prototype-${prototype}`] = `./${huron.output}/prototypes/prototype-${prototype}.html`;
  });

  // Generate a list of paths and IDs for all templates
  for (let template in templateObj) {

    // Check if a template is an object or a string.
    // If it's an object, go through it until
    // and still push it into the path array.
    //
    // @todo This is only going to work for one-level arrays and
    // most certainly can be refactored.
    if ('object' === typeof templateObj[template]) {
      for (let type in templateObj[template]) {
         templatePathArray.push(`'${templateObj[template][type]}'`);
      }
    } else {
      templatePathArray.push(`'${templateObj[template]}'`);
    }
  };

  // Initialize templates, js, css and HMR acceptance logic
  const prependScript = [
    `export const templates = {};`,
    `export function addCallback(cb) {`,
      // @todo currently HMR on hbs/json files is BROKEN
      // This is because it will pass on the file that changed to reload
      // (i.e. the hbs template or the JSON object) and not the the object pair.
      // The following callback was a suggestion from Owen:
      //
      // `renderCallback = ${huron.templates.callback.stringify()}`,
      `templateReplaceCallback = cb;`,
    `}`,
    `let templateReplaceCallback = null`,
    `let renderCallback = null`,
    `if (module.hot) {`,
      `module.hot.accept(`,
        `[${templatePathArray}],`,
        `(update) => {`,
          `let updatedModules = Object.keys(update);`,
          `if (updatedModules.length) {`,
            `let templateModules = update[updatedModules[0]];`,
            `if (templateModules.length) {`,
              `templateModules.forEach( (templateKey) => {`,
                `let template = __webpack_require__(templateKey);`,
                `templateReplaceCallback(template, templates);`,
              `});`,
            `}`,
          `}`,
        `}`,
      `);`,
    `}`,
  ];

  // Generate templates object using template IDs as keys.
  // This will require the files, or create an object with keys and
  // the required files.
  for (let template in templateObj) {
    prependScript.push(
      `templates['${template}'] =`
    );

    // @todo this seems pretty duplicative of the code that adds
    // the stuff for hot module reloading above and should be refactored.
    if ('object' === typeof templateObj[template]) {
      prependScript.push(
      `{`
      );
      for (let type in templateObj[template]) {
         prependScript.push(`${type}: require('${templateObj[template][type]}'),`);
      }
      prependScript.push(
      `};`
      );
    } else {
      prependScript.push(
        `require('${templateObj[template]}');`
      );
    }
  };

  // Write the contents of thsi script.
  fs.outputFileSync(
    path.join(outputPath, 'huron-requires.js'),
    prependScript.join('\n')
  );

  // Save the sections information to a JSON file.
  fs.outputFileSync(
    path.join(outputPath, 'huron-sections.json'),
    JSON.stringify(sections._store)
  );
}

