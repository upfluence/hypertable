import { module, test } from 'qunit';

import TableHandler from '@upfluence/hypertable/core/handler';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Unit | core/handler', function (hooks) {
  hooks.beforeEach(function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
  });

  test('it works', function (assert) {
    const handler = new TableHandler(this.tableManager, this.rowsFetcher);
    assert.ok(handler);
  });

  test('Handler#fetchColumns', async function (assert: Assert) {
    const handler = new TableHandler(this.tableManager, this.rowsFetcher);
    assert.equal(handler.columns.length, 0);
    await handler.fetchColumns();
    assert.equal(handler.columns.length, 2);
  });

  test('Handler#fetchRows', async function (assert: Assert) {
    const handler = new TableHandler(this.tableManager, this.rowsFetcher);
    assert.equal(handler.rows.length, 0);
    await handler.fetchRows();
    assert.equal(handler.rows.length, 2);
  });

  test('Handler#addColumn', function (assert: Assert) {
    const handler = new TableHandler(this.tableManager, this.rowsFetcher);
    try {
      handler.addColumn({
        key: 'foo',
        type: 'text',
        name: `foo`,
        clustering_key: '',
        category: '',
        size: FieldSize.Medium,
        orderable: false,
        filterable: false,
        facetable: false
      });
    } catch (err) {
      assert.equal(err.message, 'NotImplemented');
    }
  });

  test('Handler#removeColumn', function (assert: Assert) {
    const handler = new TableHandler(this.tableManager, this.rowsFetcher);
    try {
      handler.removeColumn({
        key: 'foo',
        type: 'text',
        name: `foo`,
        clustering_key: '',
        category: '',
        size: FieldSize.Medium,
        orderable: false,
        filterable: false,
        facetable: false
      });
    } catch (err) {
      assert.equal(err.message, 'NotImplemented');
    }
  });

  test('Handler#applyFilter', async function (assert: Assert) {
    const handler = new TableHandler(this.tableManager, this.rowsFetcher);
    await handler.fetchColumns();

    try {
      handler.applyFilters(handler.columns[0], []);
    } catch (err) {
      assert.equal(err.message, 'NotImplemented');
    }
  });

  test('Handler#applyOrder', async function (assert: Assert) {
    const handler = new TableHandler(this.tableManager, this.rowsFetcher);
    await handler.fetchColumns();

    try {
      handler.applyOrder(handler.columns[0], { key: handler.columns[0].definition.key, direction: 'asc' });
    } catch (err) {
      assert.equal(err.message, 'NotImplemented');
    }
  });

  test('Handler#onBottomReached', async function (assert: Assert) {
    const handler = new TableHandler(this.tableManager, this.rowsFetcher);
    try {
      handler.onBottomReached();
    } catch (err) {
      assert.equal(err.message, 'NotImplemented');
    }
  });
});
