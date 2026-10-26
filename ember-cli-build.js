'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const { injectAssetMap } = require('@upfluence/oss-components/build/classic-asset-map.cjs');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    fingerprint: {
      generateAssetMap: true,
      assetMapPath: 'assets/upfluence-asset-map.json',
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot']
    }
    // Add options here
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const { maybeEmbroider } = require('@embroider/test-setup');
  const tree = maybeEmbroider(app, {
    skipBabel: [
      {
        package: 'qunit'
      }
    ]
  });
  return injectAssetMap(tree, {
    fingerprint: app.options.fingerprint,
    rootURL: app.project.config(app.env).rootURL
  });
};
