// Requires
const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const kss = require('kss');
const handlebars = require('handlebars');

/**
 * Default callback for store functions
 *
 * @param {Error} err - error passed in from memory-store
 */
function storeCb(err) {
  if (err) {
    throw err;
  }
}

/**
 * Normalize a section title for use as a filename
 *
 * @param {string} header - section header extracted from KSS documentation
 */
function normalizeHeader(header) {
  return header
    .toLowerCase()
    .replace(/\s?\W\s?/g, '-');
}

/**
 * Output an HTML stnippet for each state listed in JSON data, using handlebars template
 *
 * @param {string} filename - name of file without extension (extension will always be `.html`)
 * @param {string} templatePath - path to handlebars template
 * @param {string} statesPath - path to JSON state data
 * @param {string} output - output path
 * @param {object} templates - templates memory store
 * @param {object} huron - huron config object
 */
function writeStateTemplates(filename, templatePath, statesPath, output, templates, huron) {
  const states = JSON.parse(fs.readFileSync(statesPath, 'utf8'));
  const template = handlebars.compile(fs.readFileSync(templatePath, 'utf8'));

  for (let state in states) {
    writeTemplate(
      `${filename}-${state}`,
      output,
      template(states[state]),
      templates,
      huron
    );
  };
}

/**
 * Output an HTML stnippet for a template
 *
 * @param {string} id - key at which to store this template's path in the templates store
 * @param {string} output - output path
 * @param {string} templatePath - path relative to huron.root for requiring template
 * @param {string} content - file content to write
 * @param {object} templates - templates memory store
 * @param {object} huron - huron config object
 */
function writeTemplate(id, output, content, templates, huron) {
  let outputRelative = path.join(huron.root, huron.templates, output, `${id}.html`);
  let outputPath = path.resolve(cwd, outputRelative);

  templates.set(id, outputRelative, storeCb);
  fs.outputFileSync(outputPath, content);
  console.log(`writing ${outputPath}`);
}

/**
 * Loop through initial watched files list from Gaze
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} sections - sections memory store
 * @param {object} templates - templates memory store
 * @param {object} huron - huron configuration options
 */
export function initFiles(data, sections, templates, huron) {
  const type = Object.prototype.toString.call( data );

  switch (type) {
    case '[object Object]':
      for (let file in data) {
        initFiles(data[file], sections, templates, huron);
      }
      break;

    case '[object Array]':
      data.forEach(file => {
        initFiles(file, sections, templates, huron);
      });
      break;

    case '[object String]':
      const info = path.parse(data);
      if (info.ext) {
        updateFile(data, sections, templates, huron);
      }
      break;
  }
}

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} sections - sections memory store
 * @param {object} section - contains updated section data
 * @param {bool} isInline - is the markup for this section inline or external?
 */
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

  sections.get(section.data.referenceURI, (err, data) => {
    if (data) {
      // If section exists, merge section data
      sections.set(
        section.data.referenceURI,
        Object.assign({}, data, section.data),
        storeCb
      );
    } else {
      // If section does not exist, simple set the new section
      sections.set(section.data.referenceURI, section.data, storeCb);
    }
  });
}

/**
 * Logic for updating file inforormation based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} sections - sections memory store
 * @param {object} templates - templates memory store
 * @param {object} huron - huron configuration object
 */
export function updateFile(filepath, sections, templates, huron) {
  const file = path.parse(filepath);
  const filename = file.name.replace('_', '');
  const output = path.relative(path.resolve(cwd, huron.kss), file.dir);

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      let content = fs.readFileSync(filepath, 'utf8');
      writeTemplate(file.name, output, content, templates, huron);
      break;

    // Handlebars template, external
    case '.hbs':
    case '.handlebars':
      sections.get(file.name, (err, data) => {
        const statesPath = path.resolve(file.dir, `${file.name}.json`);

        try {
          fs.accessSync(statesPath, fs.F_OK);
        } catch (e) {
          console.log(`no data provided for template ${file.base}`);
        }

        writeStateTemplates(file.name, filepath, statesPath, output, templates, huron);
      })
      break;

    // JSON template state data
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

        writeStateTemplates(file.name, templatePath, filepath, output, templates, huron);
      })
      break;

    // KSS documentation (default extension is `.css`)
    // Will also output a template if markup is inline
    // Note: inline markup does _not_ support handlebars currently
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
              writeTemplate(
                normalizeHeader(section.data.header),
                output,
                section.data.markup,
                templates,
                huron
              );
            }

            updateSection(sections, section, isInline);
          }
        });
      } else {
        console.log(`No KSS source found in ${file.dir}`);
      }
      break;

    // This should never happen if Gaze is working properly
    default:
      console.log('unrecognized filetype');
      break;
  }
}
