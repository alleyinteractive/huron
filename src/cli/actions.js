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

// Normalize a section title for use as a filename
function normalizeHeader(header) {
  return header
    .toLowerCase()
    .replace(/\s?\W\s?/g, '-');
}

// Output an HTML stnippet for each state listed in JSON data,
// using handlebars template
function writeStateTemplates(filename, templatePath, statesPath, output, huron) {
  const states = JSON.parse(fs.readFileSync(statesPath, 'utf8'));
  const template = handlebars.compile(fs.readFileSync(templatePath, 'utf8'));

  for (let state in states) {
    let outputPath = path.resolve(cwd, huron.root, huron.templates, output, `${filename}-${state}.html`);
    let content = template(states[state]);
    fs.outputFileSync(outputPath, content);
    console.log(`output ${outputPath}`);
  };
}

// Loop through initial watched files from Gaze
export function initFiles(data, sections, huron) {
  const type = Object.prototype.toString.call( data );

  switch (type) {
    case '[object Object]':
      for (let file in data) {
        initFiles(data[file], sections, huron);
      }
      break;

    case '[object Array]':
      data.forEach(file => {
        initFiles(file, sections, huron);
      });
      break;

    case '[object String]':
      const info = path.parse(data);
      if (info.ext) {
        updateFile(data, sections, huron);
      }
      break;
  }
}

export function updateSection(sections, section, isInline) {
  // If markup is not inline, set a value for the markup filename
  // to allow us to easily determine the section reference based on a Gaze
  // 'changed' event to the markup file.
  if (section.data.markup && !isInline) {
    let markup = {};

    markup.section = section.data.referenceURI;
    markup.template = section.data.markup

    sections.set(
      `markup_${path.parse(markup.template).name}`,
      markup,
      storeCb
    );
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

  switch (file.ext) {
    case '.html':
      let outputPath = path.resolve(cwd, huron.root, huron.templates, output, `${file.name}.html`);
      let content = fs.readFileSync(filepath, 'utf8');
      fs.outputFileSync(outputPath, content);
      break;

    case '.hbs':
    case '.handlebars':
      sections.get(file.name, (err, data) => {
        const statesPath = path.resolve(file.dir, `${file.name}.json`);

        try {
          fs.accessSync(statesPath, fs.F_OK);
        } catch (e) {
          console.log(`no data provided for template ${file.base}`);
        }

        writeStateTemplates(file.name, filepath, statesPath, output, huron);
      })
      break;

    case '.json':
      sections.get(file.name, (err, data) => {
        let templatePath = null;

        try {
          templatePath = path.resolve(file.dir, `${file.name}.hbs`);
          fs.accessSync(templatePath, fs.F_OK);
        } catch (e) {
          try {
            templatePath = path.resolve(file.dir, `${file.name}.handlebars`);
            fs.accessSync(templatePath, fs.F_OK);
          } catch(e) {
            console.log(`no template provided for data ${file.base}`);
          }
        }

        writeStateTemplates(file.name, templatePath, filepath, output, huron);
      })
      break;

    case huron.kssExt:
      const kssSource = fs.readFileSync(filepath, 'utf8');

      if (kssSource) {
        kss.parse(kssSource, huron.kssOptions, (err, styleguide) => {
          if (err) {
            throw err;
          }

          if (styleguide.data.sections.length) {
            const section = styleguide.data.sections[0];
            const isInline = section.data.markup.match(/<\/[^>]*>/) !== null;

            if (isInline) {
              const outputFilename = normalizeHeader(section.data.header);
              let outputPath = path.resolve(cwd, huron.root, huron.templates, output, `${outputFilename}.html`);
              fs.outputFileSync(outputPath, section.data.markup);
              console.log(`output ${outputPath}`);
            }

            updateSection(sections, section, isInline);
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
