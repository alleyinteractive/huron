export default (huron) => ({
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
    source: false,
  },
  contentBase: huron.root,
  publicPath: `http://localhost:${huron.port}/${huron.root}`,
});
