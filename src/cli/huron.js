// CLI for Huron. Used solely to apply configuration options and
// start webpack-dev-server programmatically.

const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const program = require('commander'); // Easy program flags
const cwd = process.cwd(); // Current Working Directory
const config = require( path.resolve( __dirname, '../../config/webpack.config.js' ) );

// Process arguments
program.version('0.1.0')
	.option(
	  '--config [config]',
	  '[config] for all huron options',
	  path.resolve(__dirname, '../../config/huron.config.js')
	)
	.option(
	  '--port [port]',
	  '[port] to listen the server on',
	  (port) => parseInt(port),
	  8080
	)
	.parse(process.argv);


// Add webpack-dev-server and HMR to Huron entry point
config.entry.huron.unshift('webpack-dev-server/client?http://localhost:8080/', 'webpack/hot/dev-server');

// Add huron options to config
config.huron = require(program.config);

const compiler = webpack(config);
const server = new webpackDevServer(compiler, {
	hot: true,
	contentBase: program.config.root,
});

server.listen(program.port);
