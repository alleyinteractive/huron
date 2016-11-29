const md5 = require('js-md5');

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

    // Module caches
    this.meta = {};

    // Set store values
    this.store = store;

    // Inits
    this.cycleModules();
    this.cycleStyleguide();
  }

  /**
   * Apply a modifier to a render function
   *
   * @param {string} modifier - target modifier
   * @param {object} meta - module metadata
   */
  applyModifier(modifier, meta) {
    let rendered = false;
    let data = meta.data;

    if (data) {
      // If we have a modifier, use it, otherwise use the entire data set
      if (modifier && meta.data[modifier]) {
        data = Object.assign({}, meta.data[modifier], {modifier});
      }

      rendered = meta.render(data);
    } else {
      rendered = meta.render();
    }

    return rendered;
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

  /**
   * Replace all template markers with the actual template markup.
   *
   * @param  {string} context    The hash context for the module
   * @param  {object} filter     Filter for modules. Fields explained in the filterModules() function docs
   */
  cycleModules(context = false, filter = false) {
    let moduleList = {};
    let moduleChildren = null;
    let elementList = context;

    // We're replacing top-level elements
    if (! elementList) {
      this.regenCache();

      // Find all top-level huron placeholders
      elementList = document.querySelectorAll(
        '[data-huron-id][data-huron-type]'
      );
    }

    moduleList = this.getModuleListFromTags(elementList);

    // Loop through modules array
    Object.keys(moduleList).forEach((key) => {
      const module = this._modules[key];
      const replaceElements = moduleList[key];

      this.loadModule(key, module, replaceElements, true, filter);
    });
  }

  /**
   * Helper for reloading sections only
   */
  cycleSections() {
    this.cycleModules(false, {
      property: 'type',
      values: ['section'],
      include: true,
    });
  }

  /**
   * Reload styleguide sections and menu helpers
   */
  cycleStyleguide() {
    const sectionsQuery = document.querySelector('[huron-sections]');
    const menuQuery = document.querySelector('[huron-menu]');

    // Sections
    if (sectionsQuery) {
      sectionsQuery.innerHTML = '';
      this.outputSections(null, sectionsQuery);
      this.cycleSections();
    }

    // Menu
    if (menuQuery) {
      menuQuery.innerHTML = '';

      if (null === document.querySelector('.section-menu__expand')) {
        const menuTrigger = document.createElement('button');

        menuTrigger.classList.add('section-menu__expand');
        menuTrigger.innerHTML = 'Sections Menu';
        document.body.insertBefore(
          menuQuery.appendChild(menuTrigger),
          document.body.childNodes[0]
        );

        // Add menu trigger handler
        menuTrigger.addEventListener('click', () => {
          document.body.classList.toggle('section-menu-open');
        });
      }

      // Create menu
      this.outputMenu(null, menuQuery);
    }
  }

  /**
   * Filter module object by module key or module type
   *
   * @param {object} filter - Filter for modules. Options:
   * @param {string} filter.property - Which property to filter ('key' or 'type')
   * @param {array}  filter.values - Values for property
   * @param {bool}   filter.include - Whether the values should be included or excluded (true = include, false = exclude)
   * @param {object} moduleMeta  Filter for modules. Fields explained in the filterModules() function docs
   */
  filterModules(filter, moduleMeta) {
    const moduleKeys = Object.keys(this._modules);
    let match = true;

    // Check if we should filter out any modules
    if (
      'object' === typeof filter &&
      filter.hasOwnProperty('property') &&
      filter.hasOwnProperty('values') &&
      filter.hasOwnProperty('include')
    ) {
      match = filter.values.filter((value) => moduleMeta[filter.property] === value);
      return Boolean(match.length) === filter.include;
    }

    console.log(`
      filter ${filter} is not in a valid format.
      module filters must include 'property', 'values', and 'include' properties
    `);

    return match;
  }

  /**
   * Generate a hash string from a module key
   *
   * @param {string} key - module key (require path) to convert into a hash
   */
  generateModuleHash(key) {
    return md5(key);
  }

  /**
   * Get module metadata from a module require path
   *
   * @param  {string} key - Module require path
   *
   * @return {object} - id: huron id (referenceURI)
   *                    type: huron type
   *                    key: module require path (key)
   *                    module: module contents
   */
  getMetaFromPath(key, module) {
    const sections = this._sections.sectionsByPath;
    const templateTypes = this._types.filter((type) => type !== 'prototype');
    let id = false;
    let type = false;

    if (key.indexOf(`./prototypes`) !== -1) {
      const prototype = Object.keys(this._prototypes)
        .filter((name) => this._prototypes[name] === key);

      if (prototype.length) {
        id = prototype[0];
        type = 'prototype';
      }
    } else if (key === this._sectionTemplatePath) {
      id = 'sections-template',
      type = 'sections-template';
    } else {
      for (let section in sections) {
        const testTypes = templateTypes.filter((type) => sections[section][`${type}Path`] === key);

        if (testTypes.length) {
          id = sections[section].referenceURI;
          type = testTypes[0];
          break;
        }
      }
    }

    if (id && type) {
      const hashKey = 'data' === type ? this._templates[key] : key;
      const renderData = this.getModuleRender(type, key, module);
      const hash = this.generateModuleHash(hashKey);

      if (renderData) {
        return Object.assign({id, type, key, hash, module}, renderData);
      }
    }

    console.warn(`Could not find module '${key}' or module cannot be hot reloaded`);
    return false;
  }

  /**
   * Check if a tag is a huron placeholder and, if so,
   * return its associated module key
   *
   * @param {object} tag - tag to check
   */
  getModuleKeyFromTag(tag) {
    const type = tag.dataset.huronType;
    const id = tag.dataset.huronId;
    const section = this._sections.sectionsByURI[id];

    if (id && type) {
      if (section) {
        return section[`${type}Path`];
      } else if ('prototype' === type) {
        return this._prototypes[id];
      }
    }

    return false;
  }

  /**
   * Check if an array of elements contains a Huron placeholder
   *
   * @param {array} tags - array of DOM nodes
   * @param {bool} recurse - should we recurse this function with a new array
   */
  getModuleListFromTags(elements, recurse = true) {
    const moduleList = {};
    let newList = {};

    if (elements && elements.length) {
      elements.forEach((element) => {
        const moduleKey = this.getModuleKeyFromTag(element);

        if (moduleKey) {
          if (! moduleList[moduleKey]) {
            moduleList[moduleKey] = [];
          }
          moduleList[moduleKey].push(element);
        } else if (recurse) {
          newList = this.getModuleListFromTags(
            [...element.querySelectorAll('[data-huron-id][data-huron-type]')],
            false
          );

          Object.keys(newList).forEach((key) => {
            moduleList[key] = moduleList[key] ?
              modulList[key].concat(newList[key]) :
              newList[key];
          });
        }
      });
    }

    return moduleList;
  }

  /**
   * Transform every module into a predictable object
   *
   * @param  {object} type    Module metadata
   * @param  {mixed}  module  Module contents
   *
   * @return {object} render: render function
   *                  data: original module contents
   *                  id: id of partial
   */
  getModuleRender(type, key, module) {
    let render = false;
    let data = false;

    if ('template' === type && 'function' === typeof module) {
      // It's a render function for a template
      render = module;
      data = this._modules[this._templates[key]];
    } else if (
      'sections-template' === type &&
      'function' === typeof module
    ) {
      // It's a kss section template
      render = module;
    } else if (
      'section' === type &&
      'object' === typeof module
    ) {
      // It's section data
      render = this._modules[this._sectionTemplatePath];
      data = module;
    } else if (
      ('template' === type || 'description' === type || 'prototype' === type) &&
      'string' === typeof module
    ) {
      // it's straight HTML
      render = () => module;
    } else if ('data' === type && 'object' === typeof module) {
      // It's a data file (.json)
      render = this._modules[this._templates[key]];
      data = module;
    }

    // Only need render, as data will be left empty for static HTML
    if (render) {
      return {render, data};
    }

    return false;
  }

  /**
   * Check if this tag is a styleguide helper
   *
   * @param {object} tag - tag to check
   * @param {object} meta - module metadata
   */
  isSectionHelper(tag, meta) {
    if ('prototype' === meta.type) {
      return tag.hasAttribute('huron-sections') ||
        tag.hasAttribute('huron-menu');
    }

    return false;
  }

  /**
   * Replace all sections. For hot reloading use when the section template has changed.
   *
   * @param {object}  replaceElements     The context (e.g. document) that you will query
   *                                      for the template ID to replace
   * @param {string}  key                 Module require path
   * @param {mixed}   module              Module contents
   * @param {bool}    cached             Whether or not to use cached values for module replacement
   * @param {object}  filter              Filter for modules. Fields explained in the filterModules() function docs
   */
  loadModule(key, module, replaceElements, cached = false, filter = false) {
    let shouldLoad = true;
    let moduleMeta = false;

    // Check if we should load from internal module metadata cache
    if (cached) {
      moduleMeta = this.meta[key];
    } else {
      moduleMeta = this.meta[key] = this.getMetaFromPath(key, module);
    }

    if (moduleMeta) {
      if (filter) {
        shouldLoad = this.filterModules(filter, moduleMeta);
      }

      if (shouldLoad) {
        this.replaceTemplate(moduleMeta, replaceElements);
      }
    }
  }

  /*
   * Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <ul> to be used as a menu for each section
   */
  outputMenu(parent, el, sections = this._sections.sorted) {
    let templateId = null;
    let wrapper = null;

    for (let section in sections) {
      const hasSubmenu = Object.keys(sections[section]).length;
      let menuTarget;
      let nextMenu;

      if (parent) {
        templateId = `${parent}-${section}`;
      } else {
        templateId = section;
      }

      if (el) {
        const title = this._sections
            .sectionsByURI[templateId] ?
          this._sections
            .sectionsByURI[templateId]
            .header :
          templateId;
        const sectionMenu = document.createElement('ul');
        const menuItem = document.createElement('li');
        const link = `<a href="#styleguide-section-${templateId}">${title}</a>`;

        sectionMenu.classList.add('section-menu');
        menuItem.classList.add('section-menu__item');
        menuItem.innerHTML = link;

        // Check if this is a UL and, if not, create one
        if ('UL' !== el.tagName) {
          menuTarget = sectionMenu.cloneNode();
          el.appendChild(menuTarget);
          el = menuTarget;
        }

        // Has subsections
        if (hasSubmenu) {
          nextMenu = sectionMenu.cloneNode();
          nextMenu.classList.add('section-menu--submenu');
          menuItem.classList.add('section-menu__item--has-submenu');
          menuItem.appendChild(nextMenu);
        }

        el.appendChild(menuItem);

        if (hasSubmenu) {
          this.outputMenu(
            templateId,
            nextMenu,
            sections[section]
          );
        }
      }
    }
  }

  /**
   * Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <section> tag with
   * [huron-id] equal to the section template name.
   */
  outputSections(parent, el, sections = this._sections.sorted) {
    let templateId = null;
    let placeholder = null;

    for (let section in sections) {
      let currentHash = false;
      let istopLevel = false;
      let topLevelWrapper = null;
      let topLevelSection = null;
      let insertionEl = el;

      // Generate section ID and check if it is top-level
      if (parent) {
        templateId = `${parent}-${section}`;
      } else {
        templateId = section;
        istopLevel = true;
      }

      if (el) {
        // Generate huron placeholder for this section
        placeholder = document.createElement('div');
        placeholder.dataset.huronId = templateId;
        placeholder.dataset.huronType = 'section';

        if (istopLevel) {
          // Generate wrapper to contain top-level section and all subsections underneath it
          topLevelWrapper = document.createElement('div');
          topLevelWrapper.classList.add('section--top-level__wrapper');

          // Generate wrapper for top-level section
          topLevelSection = document.createElement('div');
          topLevelSection.classList.add('section', 'section--top-level');

          // Append wrappers to huron-sections element
          topLevelSection.appendChild(placeholder)
          topLevelWrapper.appendChild(topLevelSection);
          el.appendChild(topLevelWrapper);
          insertionEl = topLevelWrapper;
        } else {
          // If this is not top-level, append placeholder
          el.appendChild(placeholder);
        }
      }

      // Recursively call this function to insert other sections
      if (Object.keys(sections[section]).length && placeholder) {
        this.outputSections(
          templateId,
          insertionEl,
          sections[section]
        );
      }
    }
  }

  /**
   * Regenerate module meta cache
   */
  regenCache() {
    for (let moduleKey in this._modules) {
      this.meta[moduleKey] = this.getMetaFromPath(
        moduleKey, this._modules[moduleKey]
      );
    }
  }

  /**
   * Recursively remove old tags
   *
   * @param {string} hash - hash of module for which we need to remove old tags
   * @param {object} tag - tag to start our search with
   *                       (usually the tag immediately preceding the current placeholder)
   */
  removeOldTags(hash, tag) {
    if (tag && tag.dataset) {

      if (tag.dataset.selfHash === hash) {
        // This is another instance of this module
        return;
      } else if (tag.dataset.parentHash === hash) {
        // This is a child of the current module,
        // so remove it and its children (if applicable)
        let childrenHash = tag.dataset.selfHash;
        let nextTag = tag.previousSibling;

        if (childrenHash) {
          this.removeOldTags(childrenHash, nextTag);
          // Reset nextTag if we removed a child
          nextTag = tag.previousSibling;
        }

        tag.parentNode.removeChild(tag);
        this.removeOldTags(hash, nextTag);
      }
    }
  }

  /**
   * Replace a single template marker with template content.
   *
   * @param {object} replaceElements - Array of elements to check for Huron placeholders
   * @param {object} meta - Module metadata
   */
  replaceTemplate(meta, replaceElements) {
    const type = this.validateType(meta.type);
    let tags = [];
    let hasStyleguideHelpers = false;

    if (!replaceElements) {
      replaceElements = document.querySelectorAll(
        '[data-huron-id][data-huron-type]'
      );
    }

    if (type) {
      replaceElements.forEach((tag) => {
        if (
          tag.dataset &&
          tag.dataset.huronId === meta.id &&
          tag.dataset.huronType === type
        ) {
           tags.push(tag);
        }
      });

      if (tags && tags.length && meta.render) {
        tags.forEach((currentTag) => {
          const modifier = currentTag.dataset.huronModifier;
          const parent = currentTag.parentNode;
          const rendered = this.applyModifier(modifier, meta);
          const renderedTemplate = this.convertToElement(rendered)
              .querySelector('template');
          let renderedContents = null;

          // Remove existing module tags
          this.removeOldTags(meta.hash, currentTag.previousSibling);

          // Get the contents of the rendered template
          renderedContents = [
            ...renderedTemplate.content.children
          ];

          // Insert each tag of the template contents before placeholder
          renderedContents.forEach((element) => {
            if (1 === element.nodeType) {
              element.dataset.parentHash = meta.hash;
              hasStyleguideHelpers = ! hasStyleguideHelpers ?
                this.isSectionHelper(element, meta) :
                hasStyleguideHelpers;

              parent.insertBefore(element, currentTag);
            }
          });

          // Add module hash to this placeholder
          currentTag.dataset.selfHash = meta.hash;

          // Hide the placeholder
          currentTag.style.display = 'none';

          // Recursively load modules, excluding the current one
          this.cycleModules(renderedContents, {
            property: 'key',
            values: [meta.key, this._sectionTemplatePath],
            include: false,
          });

          if (hasStyleguideHelpers) {
            this.cycleStyleguide();
          }
        });
      }
    } else {
      console.warn(
        `Could not render module
        section: ${meta.id}
        type: ${meta.type}`
      );
    }
  }

  /**
   * Verify specified element is using an acceptable huron type
   *
   * @param  {string} type - type of partial
   *                         (template, data, description, section or prototype )
   *
   * @return {string} - huron type or 'template' if invalid
   */
  validateType(type) {
    if ('data' === type) {
      return 'template';
    }

    if (!this._types.includes(type)) {
      return false;
    }

    return type;
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
    this._sectionTemplatePath = store.sectionTemplatePath
  }
}

// Create a new instance of the InsertNodes class
/*eslint-disable*/
// Create object for modifiying the templates on the page and
// initial first templates.
const insert = new InsertNodes(modules, store);
/*eslint-enable*/
