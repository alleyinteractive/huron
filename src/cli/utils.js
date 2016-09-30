// Requires
const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const kss = require('kss');

// Imports
import { updateSection } from './actions';

export function updateFile(filepath, sections, huron) {
  const file = path.parse(filepath);
  const filename = file.name.replace('_', '');
  let kssSource = null;

  console.log('update file', path.relative(filepath, cwd));

  switch (file.ext) {
    case '.html':
      fs.writeFileSync(path.resolve(cwd, huron.root, huron.output));
      break;

    case '.hbs':
    case '.handlebars':
      break;

    case huron.kssExt:
      kssSource = fs.readFileSync(filepath, 'utf8');
      if (kssSource) {
        kss.parse(kssSource, huron.kssOptions, (err, styleguide) => {
          if (styleguide.data.sections.length) {
            if (err) {
              throw err;
            }

            const section = styleguide.data.sections[0];
            updateSection(section);
          }
        });
      } else {
        console.log(`No KSS source found in ${file.dir}`);
      }
      break;

    default:
      console.log('unrecognized filetype');
      break;
  }

  // if (file.ext === huron.kssExt) {

  // } else {
  //   const siblings = fs.readdirSync(file.dir);
  //   siblings.forEach(sibling => {
  //     let sibData = path.parse(sibling);
  //     if (sibData.ext === huron.kssExt && sibData.name === filename) {
  //       kssSource = fs.readFileSync(sibling, 'utf8');
  //     }
  //   });
  // }
}

export function addFile(filepath) {
  const file = path.parse(filepath);
  const filename = file.name.replace('_', '');
}
