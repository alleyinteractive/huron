'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = startWebpack;

var _parseArgs = require('./parse-args');

var _parseArgs2 = _interopRequireDefault(_parseArgs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpack = require('webpack'); /** @module cli/webpack-server */

var WebpackDevServer = require('webpack-dev-server');

/**
 * Spin up webpack-dev-server or, if production flag is set, run webpack a single time
 *
 * @function startWebpack
 * @param {object} config - webpack configuration, preprocessed by {@link module:cli/generate-config generateConfig}
 * @see {@link module:cli/generate-config generateConfig}
 */
function startWebpack(config) {
  var huron = config.huron;
  var webpackConfig = config.webpack;
  var compiler = webpack(webpackConfig);

  if (_parseArgs2.default.progress) {
    compiler.apply(new webpack.ProgressPlugin(function (percentage, msg) {
      console.log(percentage * 100 + '% ', msg);
    }));
  }

  if (_parseArgs2.default.production) {
    compiler.run(function (err) {
      if (err) {
        console.log(err);
      }
    });
  } else {
    var server = new WebpackDevServer(compiler, {
      hot: true,
      quiet: false,
      noInfo: false,
      stats: {
        colors: true,
        hash: false,
        version: false,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false
      },
      contentBase: huron.root,
      publicPath: 'http://localhost:' + huron.port + '/' + huron.root
    });
    server.listen(huron.port, 'localhost', function (err) {
      if (err) {
        return console.log(err);
      }

      console.log('Listening at http://localhost:' + huron.port + '/');
      return true;
    });
  }
}
//# sourceMappingURL=server.js.map