// import path from 'path';

export default (huron) => ({
  hot: true,
  host: 'localhost',
  quiet: false,
  noInfo: false,
  overlay: true,
  stats: {
    colors: true,
    hash: false,
    version: false,
    assets: false,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
  },
  publicPath: `/${huron.root}`,
});
