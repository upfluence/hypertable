'use strict';

const { name, version } = require('./package');

module.exports = {
  name,
  version,

  options: {
    babel: {
      // eslint-disable-next-line node/no-unpublished-require
      plugins: [...require('ember-cli-code-coverage').buildBabelPlugin()]
    }
  },

  isDevelopingAddon() {
    return true;
  }
};
