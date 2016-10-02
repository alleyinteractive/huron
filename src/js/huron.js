// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

/* Method for inserting HTML snippets at particular insertion points
 *
 * Uses require() to grab html partials, then inserts that html
 * into an element with an attribute `huron-id` corresponding to the template filename.
 */
class InsertNodes {

  constructor(modules, store) {
    this._modules = modules;
    this._moduleIds = Object.keys(modules);
    this._config = null;
    this._sections = null;
    this._templates = null;
    this._prototypes = null;
    this._types = null;

    // Set store values
    this.store = store;

    // Inits
    this.cycleEls(document);
  }

  /**
   * Replace all template markers with the actual template markup.
   *
   * @param  {object} context  The context (e.g. document) that you will query
   *                           for the template ID to replace
   * @param  {string} parentId The TemplateID of the tempkate that invoked this function.
   */
  cycleEls(context, parentId = null) {
    // Query any element with huron id
    const huronPartials = context.querySelectorAll('[data-huron-id]');
    const sections = this._sections.sectionsByPath;

    if (null !== huronPartials) {
      for (let i = 0; i < huronPartials.length; i++) {
        const currentTag = huronPartials.item(i);
        const type = this.validateType(currentTag);
        const id = currentTag.dataset.huronId;
        const field = `${type}Path`; // Custom field in section data containing require path to partial
        let requirePath = false;
        let currentSection = false;

        // Only replace if the partial does not have children
        if (currentTag.childNodes.length === 0) {
          // Find require path based on huron type
          if ('template' === type || 'description' === type ) {
            for (let section in sections) {
              if (id === sections[section].referenceURI) {
                requirePath = sections[section][field];
              }
            }
          } else if ('prototype' === type) {
            for (let prototype in this._prototypes) {
              if (id === prototype) {
                requirePath = this._prototypes[id];
              }
            }
          } else if ('section' === type) {
            // Get section data
            for (let section in sections) {
              if (id === sections[section].referenceURI) {
                currentSection = sections[section];
              }
            }

            // Require path is always the same for sections
            requirePath = `./huron-sections/sections.hbs`;
          }

          // Normalize module and replace template marker
          if (requirePath) {
            this.replaceTemplate(requirePath, this._modules[requirePath], {
              data: currentSection,
              id: id,
              type: type,
            });
          }
        }
      }
    }
  }

  cycleModules() {
    for (let module in this._modules) {
      this.loadTemplate(module);
    }
  }

  loadTemplate(key) {
    if (moduleInfo) {
      this.replaceTemplate(key, this._modules[module]);
    } else {
      console.warn(`Could not find module ${key} or this module cannot be hot reloaded`);
    }
  }

  /**
   * Replace a single template marker with template content.
   * This is called by HMR when modules are edited.
   *
   * @param  {string} id       Huron id (referenceURI)
   * @param  {string} type     Huron type
   * @param  {mixed}  key      Require path (key for module contents in modules object)
   * @param  {string} module   contents of module
   * @param  {object} data     Explicitly-defined data (usually used for KSS sections)
   */
  replaceTemplate(key, module, data = false) {
    const normalized = this.normalizeModuleMeta(key, module, data);
    const tags = document.querySelectorAll(`[data-huron-id="${id}"][data-huron-type="${type}"]`);

    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        let modifier = tag.dataset.huronModifier;
        let rendered = null;

        if (currentModule.data) {
          if (modifier && currentModule.data[modifier]) {
            rendered = currentModule.render(currentModule.data[modifier]);
          } else {
            rendered = currentModule.render(currentModule.data);
          }
        } else {
          rendered = currentModule.render();
        }

        tag.innerHTML = this.convertToElement(rendered)
          .querySelector('template')
          .innerHTML

        this.cycleEls(tag, currentModule.id);
      }
    }
  }

  /**
   * Check if module path matches any of templatePath, dataPath, sectionPath, or descriptionPath.
   * Use for webpack HMR logic
   *
   * @param  {string} path - Module require path
   *
   * @return {object} - section: KSS section data
   *                    type: huron type
   */
  getMetaFromPath(path) {
    const sections = this._sections.sectionsByPath;
    const templateTypes = this._types.filter((type) => type !== 'prototype');

    if (path.indexOf(`${this._config.output}/prototypes`) !== -1) {
      const prototype = Object.keys(this._prototypes)
        .filter((key) => this._prototypes[key] === path);

      if (prototype.length) {
        return {
          id: prototype,
          type: 'prototype'
        };
      }
    // @todo Can't hot reload sections template yet. Should we even bother?
    } else if (path.indexOf('sections.hbs') === -1) {
      for (let section in sections) {
        const testTypes = templateTypes.filter((type) => sections[section][`${type}Path`] === path);

        if (testTypes.length) {
          return {
            id: sections[section].referenceURI,
            type: testTypes[0]
          };
        }
      }
    }

    return false;
  }

  /**
   * Verify specified element is using an acceptable huron type
   *
   * @param  {HTMLElement} element - Html element to check huron type
   *
   * @return {string} - huron type or 'template' if invalid
   */
  validateType(element) {
    const type = element.dataset.huronType;

    if (!this._types.includes(type)) {
      return 'template';
    }

    return type;
  }

  /**
   * Transform every module into a predictable object
   *
   * @param  {string} key     Key of module in modules object
   * @param  {mixed}  module  The contents of the module
   * @param  {string} type    Module type
   * @param  {object} explicitData    Explicitly-defined data (usually used for KSS sections)
   *
   * @return {object} render: render function
   *                  data: original module contents
   *                  id: id of partial
   */
  normalizeModuleMeta(key, module, meta = false) {
    let metaNormalized = false;

    if (!data || !data.id) {
      metaNormalized = this.getMetaFromPath(key);
    }

    if (metaNormalized) {
      if ('template' === type && 'function' === typeof module) {
        // It's a render function for a template
        metaNormalized.render = module;
        metaNormalized.data = this._modules[this._templates[key]];
      } else if (
        'section' === type &&
        'function' === typeof module
      ) {
        // It's a full KSS section
        // Data is passed in from cycleEls
        metaNormalized.render = module;
        metaNormalized.data = meta.data;
      } else if (
        ('template' === type || 'description' === type || 'prototype' === type) &&
        'string' === typeof module
      ) {
        // it's straight HTML
        render = () => module;
      } else if ('data' === type) {
        // It's a data file (.json)
        metaNormalized.render = this._modules[this._templates[key]];
        metaNormalized.data = module;
      }

      return {render, data, id};
    }

    return false;
  }

  /**
   * Get markup from any type of module (html, json or template)
   *
   * @param {string} content String corresponding to markup
   */
  convertToElement(content) {
    let el = document.createElement('div');
    el.innerHTML = content;
    return el.firstElementChild;
  }

  /*
   * Check if a template contains a specific subtemplate.
   */
  hasTemplate(template, templateId) {
    if (templateId !== null) {
      const subTemplate = template
        .querySelector('template')
        .content
        .querySelector(`[data-huron-id=${templateId}`);

      if (subTemplate !== null) {
        return true;
      }
    }

    return false;
  }

  /*
   * Set new modules object
   */
  set modules(modules) {
    this._modules = modules;
    this._moduleIds = Object.keys(modules);
  }

  /*
   * Set store
   */
  set store(store) {
    this._store = store;
    this._config = store.config;
    this._sections = store.sections;
    this._templates = store.templates;
    this._prototypes = store.prototypes;
    this._types = store.types;
  }
}

/* Helper function for inserting styleguide sections.
 *
 * Recurses over sorted styleguide sections and inserts a <section> tag with
 * [huron-id] equal to the section template name.
 *
 * @todo: figure out how to handle added/removed sections with HMR
 * @todo: incorporate this function into the InsertNodes class
 */
function outputSections(sections, parent, el) {
  let templateId = null;
  let templateString = null;
  let wrapper = null;

  for (let section in sections) {
    if (parent) {
      templateId = `${parent}-${section}`;
    } else {
      templateId = section;
    }

    templateString = `section-${templateId}`;

    if (el) {
      wrapper = document.createElement('div');
      wrapper.dataset.huronId = templateString;
      el.appendChild(wrapper);
    }

    if (sections[section] && wrapper) {
      outputSections(
        sections[section],
        templateId,
        document.querySelector(`[data-huron-id=${templateString}]`)
      );
    }
  }
}

// Create a new instance of the InsertNodes class
/*eslint-disable*/
// Create object for modifiying the templates on the page and
// initial first templates.
const insert = new InsertNodes(modules, store);
const sectionsQuery = document.querySelector('[huron-sections]');

if (sectionsQuery) {
  outputSections(sections.sorted, null, sectionsQuery);
  insert.cycleEls(document);
}
/*eslint-enable*/
