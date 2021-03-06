import webpack from 'webpack';
import path from 'path';

import program from '../cli/parseArgs';

export default (huron) => {
  const cwd = process.cwd();

  return {
    entry: {},
    output: {
      path: path.join(cwd, huron.root),
      publicPath: program.production ? '' :
        `/${huron.root}`,
      filename: '[name].js',
      chunkFilename: '[name].chunk.min.js',
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
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
      rules: [
        {
          test: /\.html$/,
          include: [path.join(cwd, huron.root, huron.output)],
          use: 'html-loader',
        },
        {
          test: /\.(hbs|handlebars)$/,
          include: [path.join(cwd, huron.root, 'huron-assets')],
          use: {
            loader: 'handlebars-loader',
            options: {
              helperDirs: [path.join(
                __dirname,
                '../../',
                'templates/handlebarsHelpers'
              )],
            },
          },
        },
      ],
    },
  };
};
