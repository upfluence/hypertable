'use strict';

module.exports = async function () {
  return {
    packageManager: 'pnpm',
    command: 'ember test --silent -r dot',
    scenarios: [
      {
        name: 'ember-lts-3.28'
      },
      {
        name: 'ember-4.12',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': false // Disable per https://deprecations.emberjs.com/id/optional-feature-jquery-integration
          })
        },
        npm: {
          devDependencies: {
            'ember-source': '~4.12.3',
            'ember-cli': '~4.12.3'
          }
        }
      }
    ]
  };
};
