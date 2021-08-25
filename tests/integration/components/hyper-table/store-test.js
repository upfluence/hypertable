import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { NoOpStore, LocalStorageStore } from '@upfluence/hypertable/types/store';

module('Integration | Component | hyper-table/store', function (hooks) {
  setupRenderingTest(hooks);

  module('no store has been passed', function () {
    test('it uses the NoOpStore as store on the table', async function (assert) {
      this.table = this.owner.lookup('service:hypertable-manager').createTable({});
      this.table.updateData([]);

      assert.equal(this.table.options.store.constructor, NoOpStore);
    });
  });

  module('using localStorage as store', function () {
    test('it correctly initializes an instance of LocalStorageStore as store', async function (assert) {
      this.table = this.owner.lookup('service:hypertable-manager').createTable({ store: new LocalStorageStore('foo') });

      assert.equal(this.table.options.store.constructor, LocalStorageStore);
    });

    test('it correctly updates the localStorage', async function (assert) {
      this.table = this.owner.lookup('service:hypertable-manager').createTable({ store: new LocalStorageStore('foo') });

      this.table.options.store.updateState([{ key: 'foo' }]).then((resp) => assert.equal(resp, null));
      assert.deepEqual(JSON.parse(window.localStorage.getItem('foo')), [{ key: 'foo' }]);

      window.localStorage.removeItem('foo');
    });

    test('it correctly reads from the localStorage', async function (assert) {
      this.table = this.owner.lookup('service:hypertable-manager').createTable({ store: new LocalStorageStore('foo') });

      window.localStorage.setItem('foo', JSON.stringify([{ key: 'bar' }]));

      this.table.options.store.getState().then((state) => {
        assert.deepEqual(state, [{ key: 'bar' }]);
      });

      window.localStorage.removeItem('foo');
    });
  });
});
