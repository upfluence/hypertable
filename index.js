'use strict';

const { name, version } = require('./package');

module.exports = {
  name,
  version,

  options: {
    babel: {
      plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()]
    }
  },

  isDevelopingAddon() {
    return true;
  }
};
