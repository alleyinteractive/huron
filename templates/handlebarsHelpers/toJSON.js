const Handlebars = require('handlebars');

/**
 * Convert object to JSON in a handlebars template
 */
module.exports = function toJSON(object) {
  return new Handlebars.SafeString(JSON.stringify(object));
};

