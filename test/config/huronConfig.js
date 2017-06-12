import path from 'path';
import { Map } from 'immutable';

const huronConfig = Map({
  css: [],
  entry: 'huron',
  js: [],
  kss: ['test/scss-one', 'test/scss-two'],
  kssExtension: '.scss',
  kssOptions: {
    multiline: true,
    markdown: true,
    custom: ['data'],
  },
  output: 'partials',
  port: 8080,
  prototypes: ['index'],
  root: 'dist/',
  sectionTemplate: path.join(__dirname, '../templates/section.hbs'),
  templates: {
    rule: {
      test: /\.(hbs|handlebars)$/,
      use: 'handlebars-template-loader',
    },
    extension: '.hbs',
  },
  window: {},
});

export default huronConfig;
