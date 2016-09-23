var webpack = require('webpack'),
    path = require('path'),
    cwd = process.cwd();

export const defaultConfig = {
  entry: {},
  output: {
    // path: [huron root directory],
    filename: '[name].js',
    chunkFilename: '[name].chunk.min.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    modulesDirectories: [
      path.resolve(__dirname, '../src/js'),
    ],
  },
  resolveLoader: {
    modulesDirectories: [
      'web_loaders',
      'web_modules',
      'node_loaders',
      'node_modules',
      path.resolve(__dirname, '../node_modules'),
    ],
  },
  module: {
    loaders: [
      {
        test: /\.html?$/,
        loader: 'dom?tag=dom-module!html',
        // include: ['path/to/templates']
      },
      {
        test: /\.json?$/,
        loaders: ['json'],
        // include: [path.join(cwd, huron.root)]
      }
    ]
  },
  huron: {
    css: [],
    entry: 'huron',
    js: [],
    kss: 'css/',
    kssExtension: '.css',
    kssOptions: {
      multiline: true,
      markdown: true,
      custom: [
        'states',
      ]
    },
    ouptut: 'partials',
    port: 8080,
    prototypes: ['index'],
    root: 'dist/',
    sectionTemplate: path.join(__dirname, '../templates/section.hbs'),
    templates: {
      loader: {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      },
      extension: '.hbs'
    },
    window: {},
  }
};
