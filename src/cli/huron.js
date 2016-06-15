// CLI for Huron. Used solely to apply configuration options and
// start webpack-dev-server programmatically.

const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const program = require('commander'); // Easy program flags
const cwd = process.cwd(); // Current Working Directory
import generateConfig from './generateConfig';
import requireTemplates from './requireTemplates';

// Process arguments
program.version('0.1.0')
  .option(
    '--config [config]',
    '[config] for all huron options',
    path.resolve(__dirname, '../../config/webpack.config.js')
  )
  .option('--production', 'compile assets once for production')
  .parse(process.argv);

// Load in huron options
const localConfig = require(path.join(cwd, program.config));

// Generate dynamic requries
const huronScript = requireTemplates(localConfig);
const config = generateConfig(localConfig, huronScript);
const huron = config.huron;

// Build for production
if (program.production) {
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
    stats: {colors: true},
    contentBase: huron.root,
    publicPath: `http://localhost:${huron.port}/${huron.root}`,
  });
  server.listen(huron.port, 'localhost', function (err, result) {
    if (err) {
      return console.log(err);
    }

    console.log(`Listening at http://localhost:${huron.port}/`);
  });
}
