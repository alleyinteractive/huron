import webpack from 'webpack';
import path from 'path';

import program from '../cli/parseArgs';

export default ({ root, output }) => ({
  mode: 'development',
  entry: {},
  output: {
    path: path.join(process.cwd(), root),
    publicPath: program.production ? '' :
      `/${root}`,
    filename: '[name].js',
    chunkFilename: '[name].chunk.min.js',
  },
  optimization: {
    namedModules: true,
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
    rules: [
      {
        test: /\.html$/,
        include: [path.join(process.cwd(), root, output)],
        use: 'html-loader',
      },
      {
        test: /\.(hbs|handlebars)$/,
        include: [path.join(process.cwd(), root, 'huron-assets')],
        use: {
          loader: 'handlebars-loader',
          query: {
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
});
