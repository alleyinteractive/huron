// CLI for Huron. Used solely to apply configuration options and
// start webpack-dev-server programmatically.

const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const program = require('commander'); // Easy program flags
const cwd = process.cwd(); // Current Working Directory
const config = require( path.resolve( __dirname, '../../config/webpack.config.js' ) );
const kss = require('kss');

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
const huron = require(program.config);

kss.traverse(config.huron.kss, {mask: '*.css'}, (err, styleguide) => {
  console.log(styleguide);
});

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
  // Add webpack-dev-server and HMR to Huron entry point
  config.entry.huron.unshift(`webpack-dev-server/client?http://localhost:${program.port}/`, 'webpack/hot/dev-server');

  const compiler = webpack(config);
  const server = new webpackDevServer(compiler, {
    hot: true,
    contentBase: huron.root,
  });
  server.listen(program.port);
}
