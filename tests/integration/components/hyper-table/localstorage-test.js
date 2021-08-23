import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { LocalStorageStore } from '@upfluence/hypertable/types/store';

module('Integration | Component | hyper-table/localstorage', function (hooks) {
  setupRenderingTest(hooks);

  module('feature is not enabled', function () {
    test('it does not set a store on the table', async function (assert) {
      this.table = this.owner.lookup('service:hypertable-manager').createTable({});
      this.table.updateData([]);

      assert.equal(this.table.store, null);
    });
  });

  module('feature is enabled', function () {
    test('it throws an error if the feature is enable but no options.name is passed', async function (assert) {
      try {
        this.table = this.owner.lookup('service:hypertable-manager').createTable({ features: { localStorage: true } });
      } catch (err) {
        assert.equal(
          err.message,
          '[Hypertable] Trying to use localStorage store without a store name. Please set "options.name".'
        );
      }
    });

    test('it correctly initializes an instance of LocalStorageStore as store', async function (assert) {
      this.table = this.owner
        .lookup('service:hypertable-manager')
        .createTable({ name: 'foo', features: { localStorage: true } });

      assert.equal(this.table.store.constructor, LocalStorageStore);
      assert.equal(this.table.store.key, 'foo');
    });
  });
});
