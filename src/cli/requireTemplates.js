/** @module cli/require-templates */
import path from 'path';
import fs from 'fs-extra';

// We need to prepend this to the browser script as a string but still want to transpile it,
// hence loading it using `raw-loader` so we receive a string from webpack
/* eslint-disable */
import hotTemplate from '!raw-loader!babel-loader!../../templates/hotTemplate';
/* eslint-enable */

const cwd = process.cwd();
const huronScript = fs.readFileSync(
  path.join(__dirname, '../web/index.js'),
  'utf8'
);

/**
 * Write code for requiring all generated huron assets
 *
 * @function requireTemplates
 * @param {object} store - memory store
 */
export const requireTemplates = function requireTemplates(store) {
  const huron = store.get('config');
  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');
  // These will be used to replace strings in the hotTemplate.
  // In order to accurately replace strings but still keep things parseable by eslint and babel,
  // each replaceable value should be referenced in `hotTemplate.js` under the `hotScope` object.
  // For example, if you need to replace a string with a value passed in from the CLI called `userVariable`,
  // you would reference that string in `hotTemplate.js` with `hotScope.userVariable`.
  const hotVariableScope = {
    sectionTemplatePath: `'${huron.get('sectionTemplate')}'`,
    requireRegex: new RegExp(`\\.html|\\.json|\\${
      huron.get('templates').extension
    }$`),
    requirePath: `'../${huron.get('output')}'`,
  };
  const hotTemplateTransformed = Object.keys(hotVariableScope)
    .reduce(
      (acc, curr) => acc.replace(
        new RegExp(`hotScope.${curr}`, 'g'),
        hotVariableScope[curr]
      ), hotTemplate
    );

  // Write the contents of this script.
  fs.outputFileSync(
    path.join(outputPath, 'index.js'),
    hotTemplateTransformed
  );
  fs.outputFileSync(
    path.join(outputPath, 'insertNodes.js'),
    huronScript
  );
};

/**
 * Output entire data store to a JS object and handle if any KSS data has changed
 *
 * @function writeStore
 * @param {object} store - memory store
 * @param {string} changed - filepath of changed KSS section, if applicable
 */
export const writeStore = function writeStore(store, newStore = false) {
  const updatedStore = newStore || store;
  const huron = updatedStore.get('config');
  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');

  // Write updated data store
  fs.outputFileSync(
    path.join(outputPath, 'huron-store.js'),
    `module.exports = ${JSON.stringify(updatedStore.toJSON())}`
  );
};

