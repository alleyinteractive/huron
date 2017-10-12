const path = require('path');

module.exports = {
  css: [],
  entry: 'huron',
  js: [],
  kss: 'css/',
  kssExtension: '.css',
  kssOptions: {
    multiline: true,
    markdown: true,
    custom: ['data'],
  },
  output: 'partials',
  port: 8080,
  prototypes: ['index'],
  root: 'dist/',
  sectionTemplate: path.join(__dirname, '../../templates/section.hbs'),
  classNames: false,
  templates: {
    rule: {
      test: /\.(hbs|handlebars)$/,
      use: 'handlebars-loader',
    },
    extension: '.hbs',
  },
  window: {},
};
