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
    this.types = [
      'template',
      'data',
      'description',
      'section',
      'prototype',
    ];

    // Set store values
    this.store = store;

    // Inits
    this.cyclePrototypes();
    this.cycleEls(document);
  }

  /**
   * Replace all prototype markers with prototype contents
   */
  cyclePrototypes() {
    for (let prototype in this._prototypes) {
      const protoPath = this._prototypes[prototype];
      const templateMarker = document.querySelector(`[data-huron-id=${prototype}]`);

      if (templateMarker !== null && templateMarker.childNodes.length === 0) {
        this.cycleEl(protoPath, this._modules[protoPath], document);
      }
    }
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
    const huronPartials = context.querySelector('[data-huron-id]');
    const sections = this._sections.sectionsByPath;
    const prototypes = this._prototypes;

    if (null !== huronPartials) {
      for (let i = 0; i < huronPartials.length; i++) {
        const currentPartial = huronPartials.item(i);
        const type = this.validateType(currentPartial);
        const id = currentPartial.dataset.huronId;
        const field = `${type}Path`; // Custom field in section data containing require path to partial
        let requirePath = false;
        let currentSection = false;

        // Only replace if the partial does not have children
        if (currentPartial.childNodes.length === 0) {
          // Find require path based on huron type
          if ('template' === type || 'description' === type || 'section' === type ) {
            for (section in sections) {
              if (id === sections[section].referenceURI) {
                const currentSection = sections[section];
                requirePath = currentSection[field];
                break;
              }
            }
          } else if ('prototype' === type) {
            for (prototype in prototypes) {
              if (id === prototype) {
                requirePath = currentSection[field];
              }
            }
          }

          // Normalize module and replace template marker
          if (requirePath) {
            const normalizedModule = this.normalizeModule(id, type, key, this._modules[requirePath], currentSection);

            if (normalizedModule) {
              this.replaceTemplate(id, type, normalizedModule, context);
            }
          }
        }
      }
    }
  }

  /**
   * Replace a single template marker with template content.
   * This is called by HMR when modules are edited.
   *
   * @param  {string} id              Huron id (referenceURI)
   * @param  {string} key             Key of module in modules object
   * @param  {mixed}  currentModule   Normalized module, from normalizeModule function
   * @param  {string} type            Module type
   * @param  {object} context         The context (e.g. document) that you will
   *                                   query for the template ID to replace.
   */
  replaceTemplate(id, type, currentModule, context) {
    const tags = context.querySelectorAll(`[data-huron-id=${currentModule.id}`);

    // Cycle through results and replace them.
    for (let i = 0; i < tags.length; i++) {
      let tag = tags.item(i);
      let modifier = tag.dataset.huronModifier;
      let rendered = null;

      if (modifier && currentModule.data) {
        rendered = currentModule.render(currentModule.data[modifier]);
      } else {
        rendered = currentModule.render();
      }

      tag.innerHTML = this.convertToElement(rendered)
        .querySelector('template')
        .innerHTML

      this.cycleEls(tag, currentModule.id);
    }
  }

  /**
   * Check if module path matches any of templatePath, dataPath, sectionPath, or descriptionPath
   * Use for webpack HMR logic
   *
   * @param  {string} path - Module require path
   *
   * @return {object} - section: KSS section data
   *                    type: huron type
   */
  getIdFromPath(path) {
    const sections = this._sections.sectionsByPath;
    const templateTypes = this.types.filter((type) => type !== 'prototype');

    if (path.indexOf('prototypes') === -1) {
      for (section in sections) {
        const testPath = this.templateTypes.filter((type) => section[`${type}Path`] === path);

        if (testPath.length) {
          return {
            data: section,
            type: type
          };
        }
      }
    } else {
      const prototype = Object.keys(this._prototypes)
        .filter((key) => this._prototypes[key] === path);

      if (prototype.length) {
        return {
          data: prototype,
          type: 'prototype'
        };
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

    if (!this.types.includes(type)) {
      return 'template';
    }

    return type;
  }

  /**
   * Transform every module into a predictable object
   *
   * @param  {string} key             Key of module in modules object
   * @param  {mixed}  module          The contents of the module
   * @param  {string} type            Module type
   * @param  {object} currentSection  KSS section data
   *
   * @return {object} render: render function
   *                  data: original module contents
   *                  id: id of partial
   */
  normalizeModule(id, type, key, module, currentSection = false) {
    let render = false;
    let data = false;

    if (id) {
      if ('template' === type && 'function' === typeof module) {
        // It's a render function for a template
        render = module;
        data = modules[this._templates[key]];
      } else if (
        'section' === type &&
        'function' === typeof module &&
        currentSection
      ) {
        // It's a full KSS section
        render = module;
        data = currentSection;
      } else if (
        ('template' === type || 'description' === type) &&
        'string' === typeof module
      ) {
        // it's straight HTML
        render = () => module;
      } else if ('data' === type) {
        // It's a data file (.json)
        render = modules[this._templates[key]];
        data = module;
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
