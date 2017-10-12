import { Map } from 'immutable';
import generateConfig from './generateConfig';
// Create initial data structure

// Merge Huron default webpack config with user config
const config = generateConfig();

// Make sure the kss option is represented as an array
config.huron.kss = [].concat(config.huron.kss);

/* eslint-disable */
/**
 * Initial structure for immutable data store
 *
 * @global
 */
const defaultStore = Map({
  types: [
    'template',
    'data',
    'description',
    'section',
    'prototype',
    'sections-template',
  ],
  config: Map(config.huron),
  sections: Map({
    sectionsByPath: Map({}),
    sectionsByURI: Map({}),
    sorted: {},
  }),
  templates: Map({}),
  prototypes: Map({}),
  sectionTemplatePath: '',
  referenceDelimiter: '.',
});
/* eslint-enable */

export { defaultStore, config };
