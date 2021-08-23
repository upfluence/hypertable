'use strict';

const { name, version } = require('./package');
const MergeTrees = require('broccoli-merge-trees');
const writeFile = require('broccoli-file-creator');

module.exports = {
  name,
  version,

  isDevelopingAddon: function () {
    return true;
  },

  included: function () {
    this._super.included.apply(this, arguments);

    this.import('vendor/@upfluence/hypertable/register-version.js');
  },

  treeForVendor(vendorTree) {
    let trees = [];

    if (vendorTree) {
      trees.push(vendorTree);
    }

    trees.push(
      writeFile('@upfluence/hypertable/register-version.js', `Ember.libraries.register('${name}', '${version}');`)
    );

    return new MergeTrees(trees);
  }
};
