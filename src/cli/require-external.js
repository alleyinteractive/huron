// Necessary to remove require statement from Webpack processing preserve it in output
/* eslint-disable import/no-dynamic-require, global-require */
export default function requireExternal(requirePath) {
  return require(requirePath);
}
/* eslint-enable */
