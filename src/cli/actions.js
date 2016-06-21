// Requires
const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const kss = require('kss');
const handlebars = require('handlebars');

// Default callback for store functions
function storeCb(err) {
  if (err) {
    throw err;
  }
}

export function updateSection(sections, section) {
  // If markup is not inline, set a value for the markup name
  // and grab json for data and template states
  if (section.data.markup) {
    const isInline = section.data.markup.match(/<\/[^>]*>/) !== null;
    let markup = {};

    if (!isInline) {
      markup.section = section.data.referenceURI;

      try {
        markup = JSON.parse(section.data.markup);
      } catch (e) {
        markup.template = section.data.markup
      }

      const markupFile = path.parse(markup.template);

      sections.set(
        markupFile.name,
        markup,
        storeCb
      );
    }
  }

  // Update new section values
  sections.get(section.data.referenceURI, (err, data) => {
    if (data) {
      sections.set(
        section.data.referenceURI,
        Object.assign({}, data, section.data),
        storeCb
      );
    } else {
      sections.set(section.data.referenceURI, section.data, storeCb);
    }
  });
}

export function updateFile(filepath, sections, huron) {
  const file = path.parse(filepath);
  const filename = file.name.replace('_', '');
  const output = path.relative(path.resolve(cwd, huron.kss), file.dir);
  let kssSource = null;

  switch (file.ext) {
    case '.html':
      const outputPath = path.resolve(cwd, huron.root, huron.templates, output, `${file.name}.html`);
      const content = fs.readFileSync(filepath, 'utf8');
      fs.outputFileSync(outputPath, content);
      break;

    case '.hbs':
    case '.handlebars':
      const templateRaw = fs.readFileSync(filepath, 'utf8');
      sections.get(file.name, (err, data) => {
        let statesPath = null;

        if (data.states) {
          statesPath = path.resolve(file.dir, data.states);
        } else {
          statesPath = path.resolve(file.dir, `${file.name}.json`);
        }

        if (statesPath) {
          try {
            fs.accessSync(statesPath, fs.F_OK);
          } catch (e) {
            console.log(`no data provided for handlebars template ${file.name}`);
          }

          const statesRaw = fs.readFileSync(statesPath, 'utf8');
          const states = JSON.parse(statesRaw);
          const template = handlebars.compile(templateRaw);

          if (states.for) {
            delete states.for;
          }

          for (let state in states) {
            let outputPath = path.resolve(cwd, huron.root, huron.templates, output, `${file.name}-${state}.html`)
            let content = template(states[state]);
            fs.outputFileSync(outputPath, content);
            console.log(`output ${outputPath}`);
          };
        }
      })
      break;

    case '.json':
      break;

    case huron.kssExt:
      kssSource = fs.readFileSync(filepath, 'utf8');
      if (kssSource) {
        kss.parse(kssSource, huron.kssOptions, (err, styleguide) => {
          if (err) {
            throw err;
          }

          if (styleguide.data.sections.length) {
            const section = styleguide.data.sections[0];
            updateSection(sections, section);
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
}

export function addFile(filepath) {
  const file = path.parse(filepath);
  const filename = file.name.replace('_', '');
}
