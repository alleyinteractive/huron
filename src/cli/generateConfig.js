const webpack = require('webpack');
const path = require('path');
const cwd = process.cwd();

export default function generateConfig(opts, huron, local) {
  // Generic capture of local settings
  const config = Object.assign({}, local);

  // Overwrite entries
  config.entry = {
    huron: [
      `webpack-dev-server/client?http://localhost:${opts.port}/`,
      'webpack/hot/dev-server',
      'huron',
    ],
  }

  // Add resolve
  config.resolve = config.resolve || {};
  config.resolve.modulesDirectories = config.resolve.modulesDirectories || [];
  config.resolve.modulesDirectories.push(path.resolve(__dirname, '../js'));

  // Add loader resolve
  config.resolveLoader = config.resolveLoader || {};
  config.resolveLoader.modulesDirectories = config.resolveLoader.modulesDirectories || [
    'web_loaders', 'web_modules', 'node_loaders', 'node_modules'
  ];
  config.resolveLoader.modulesDirectories.push(path.resolve(__dirname, '../../web_modules'));

  // Overwrite plugins
  if (local.plugins && local.plugins.length) {
    config.plugins = local.plugins.filter(plugin => {
      return plugin.constructor.name !== 'HotModuleReplacementPlugin';
    });
  }
  const hmr = new webpack.HotModuleReplacementPlugin();
  config.plugins.push(hmr);

  // Add loaders
  if (config.module && config.module.loaders) {
    config.module.loaders.push(
      {
        test: /huron.js$/,
        loader: 'babel!huron',
      },
      {
        test: /\.css$/,
        loader:'style-loader!css',
        include: [path.resolve(cwd, opts.root)]
      },
      {
        test: /\.html?$/,
        loader: 'dom!html',
        include: [path.resolve(cwd, opts.root, opts.templates)]
      },
      {
        test: /(\.svg|\.png)$/,
        loader: 'file',
        include: [
          path.resolve(cwd, opts.root)
        ],
      }
    );
  }

  // Set ouput options
  config.output.path = path.resolve('/', opts.root);
  config.output.filename = '[name].js';
  config.output.chunkFileName = '[name].chunk.js';

  // Remove existing devserver options
  delete config.output.publicPath;
  delete config.devServer;

  return config;
}