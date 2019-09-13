'use strict';

const { name, version } = require('./package');

module.exports = {
  name,
  version,

  isDevelopingAddon: function() {
    return true;
  }
};
