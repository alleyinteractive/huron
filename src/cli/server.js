const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
import { program } from './parseArgs';

export default function startWebpack(config) {
  const huron = config.huron;

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
}