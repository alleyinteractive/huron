'use strict';

// Huron loader
//
// Performs one simple function:
// inserting static paths so webpack can statically analyze html templates and source CSS

const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();
const kss = require('kss');

module.exports = function(source, map) {
  const output = '';
  const options = {
    multiline: true,
    markdown: true,
  };
  let section = {};

  kss.parse(source, options, (err, styleguide) => {
    if (err) {
      throw err;
    }

    if (styleguide.data.sections.length) {
      section = styleguide.data.sections[0].data;
      section.markup = 'sectionMarkup';
      console.log(section);
    }
  });

  return source;
}