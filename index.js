'use strict';

const { name, version } = require('./package');

module.exports = {
  name,
  version,

  included(parent) {
    this._super.included.apply(this, arguments);

    if (parent.project.pkg.name === name) {
      // eslint-disable-next-line node/no-unpublished-require
      this.options.babel.plugins.push(...require('ember-cli-code-coverage').buildBabelPlugin());
    }
  },

  isDevelopingAddon() {
    return true;
  }
};
