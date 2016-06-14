// CLI for Huron. Used solely to apply configuration options and
// start webpack-dev-server programmatically.

const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const program = require('commander'); // Easy program flags
const cwd = process.cwd(); // Current Working Directory
const huronWebpack = require(path.resolve( __dirname, '../../config/webpack.config.js'));
const kss = require('kss');
import generateConfig from './generateConfig';

// Process arguments
program.version('0.1.0')
  .option(
    '--config [config]',
    '[config] for all huron options',
    path.resolve(__dirname, '../../config/huron.config.js')
  )
  .option('--production', 'compile assets once for production')
  .parse(process.argv);

// Load in huron options
const huron = require(path.join(cwd, program.config));
const localWebpack = require(path.resolve(cwd, huron.webpack));

// option defaults
huron.port = huron.port || 8080;
huron.root = huron.root || cwd;

// Create config object
const config = generateConfig(huron, huronWebpack, localWebpack);
config.huron = huron;

console.log(config);

// kss.traverse(huron.kss, {mask: '*.css'}, (err, styleguide) => {
//   console.log(styleguide);
// });

// Build for production
if (program.production) {
  config.output.path = path.resolve(cwd, huron.root);
  webpack(
    config,
    (err, stats) => {
      if (err) {
        throw err;
      }
    }
  );
} else {
  const compiler = webpack(config);
  const server = new webpackDevServer(compiler, {
    hot: true,
    quiet: false,
    noInfo: false,
    contentBase: huron.root,
    publicPath: `http://localhost:${huron.port}/${huron.root}`,
    stats: {colors: true},
  });
  server.listen(huron.port, 'localhost', function (err, result) {
    if (err) {
      return console.log(err);
    }

    console.log(`Listening at http://localhost:${huron.port}/`);
  });
}
