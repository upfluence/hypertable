import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { LocalStorageStore } from '@upfluence/hypertable/types/store';
import Column from '@upfluence/hypertable/types/column';

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

    test('it correctly updates the localStorage', async function (assert) {
      this.table = this.owner
        .lookup('service:hypertable-manager')
        .createTable({ name: 'foo', features: { localStorage: true } });

      this.table.store.update([Column.create({ key: 'foo' })]);
      assert.deepEqual(JSON.parse(window.localStorage.getItem('foo')), {
        columns: [
          {
            key: 'foo',
            filters: [],
            orderBy: null
          }
        ]
      });
      window.localStorage.removeItem('foo');
    });

    test('it correctly reads from the localStorage', async function (assert) {
      this.table = this.owner
        .lookup('service:hypertable-manager')
        .createTable({ name: 'foo', features: { localStorage: true } });

      window.localStorage.setItem(
        'foo',
        JSON.stringify({
          columns: [
            {
              key: 'bar',
              filters: [],
              orderBy: null
            }
          ]
        })
      );
      assert.deepEqual(this.table.store.getState().columns, [{ key: 'bar', filters: [], orderBy: null }]);
      window.localStorage.removeItem('foo');
    });
  });
});
