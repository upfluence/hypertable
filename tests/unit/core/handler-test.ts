import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { getContext } from '@ember/test-helpers';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import BaseRenderingResolver from '@upfluence/hypertable/core/rendering-resolver';

module('Unit | core/handler', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
  });

  test('it works', function (assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.ok(handler);
  });

  test('it uses the base rendering resolver when non is passed', function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.ok(handler.renderingResolver instanceof BaseRenderingResolver);
  });

  test('Handler#fetchColumns', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.equal(handler.columns.length, 0);
    await handler.fetchColumns();
    assert.equal(handler.columns.length, 2);
  });

  test('Handler#fetchRows', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.equal(handler.rows.length, 0);
    await handler.fetchRows();
    assert.equal(handler.rows.length, 2);
  });

  test('Handler#addColumn', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.equal(handler.columns.length, 0);
    await handler.addColumn({
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

    assert.equal(handler.columns.length, 1);
    assert.equal(handler.columns[0].definition.key, 'foo');
  });

  test('Handler#removeColumn', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    handler.columns = [
      {
        definition: {
          key: 'foo',
          type: 'text',
          name: `foo`,
          clustering_key: '',
          category: '',
          size: FieldSize.Medium,
          orderable: false,
          filterable: false,
          facetable: false
        },
        filters: []
      }
    ];

    assert.equal(handler.columns.length, 1);
    await handler.removeColumn(handler.columns[0].definition);
    assert.equal(handler.columns.length, 0);
  });

  module('Handler#applyFilter', function (hooks) {
    hooks.beforeEach(async function () {
      this.handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await this.handler.fetchColumns();
    });

    test('new filters are added to the column', async function (assert: Assert) {
      this.handler.applyFilters(this.handler.columns[0], [{ key: 'foo', value: 'bar' }]);

      assert.equal(this.handler.columns[0].filters.length, 1);
      assert.deepEqual(this.handler.columns[0].filters, [
        {
          key: 'foo',
          value: 'bar'
        }
      ]);
    });

    test('existing filters are updated if they have the same key', function (assert: Assert) {
      this.handler.columns[0].filters = [{ key: 'foo', value: 'bar' }];

      this.handler.applyFilters(this.handler.columns[0], [
        { key: 'foo', value: 'batman' },
        { key: 'fizz', value: 'buzz' }
      ]);

      assert.equal(this.handler.columns[0].filters.length, 2);
      assert.deepEqual(this.handler.columns[0].filters, [
        { key: 'foo', value: 'batman' },
        { key: 'fizz', value: 'buzz' }
      ]);
    });
  });

  test('Handler#resetColumns', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    await handler.fetchColumns();

    handler.applyFilters(handler.columns[0], [{ key: 'foo', value: 'bar' }]);
    handler.applyOrder(handler.columns[1], 'asc');

    handler.resetColumns(handler.columns);

    assert.equal(handler.columns.filter((column) => column.filters.length > 0 || column.order).length, 0);
    assert.equal(handler.columns[0].filters.length, 0);
    assert.equal(handler.columns[1].order, undefined);
  });

  test('Handler#applyOrder', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const tableManagerSpy = sinon.spy(this.tableManager);

    await handler.fetchColumns();
    handler.applyOrder(handler.columns[0], 'asc');

    // @ts-ignore
    assert.ok(tableManagerSpy.upsertColumns.calledOnceWithExactly({ columns: handler.columns }));
    assert.equal(handler.currentPage, 1);
  });

  test('Handler#toggleSelectAll', function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.deepEqual(handler.selection, []);

    handler.toggleSelectAll(true);
    assert.deepEqual(handler.selection, 'all');

    handler.toggleSelectAll(false);
    assert.deepEqual(handler.selection, []);
  });

  test('Handler#updateSelection', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    await handler.fetchRows();

    assert.deepEqual(handler.selection, []);

    handler.updateSelection(handler.rows[0])
    assert.deepEqual(handler.selection, [handler.rows[0]]);

    handler.updateSelection(handler.rows[0])
    assert.deepEqual(handler.selection, []);
  });

  module('Handler#onBottomReached', function () {
    test('it does nothing if the maximum rows have been loaded already', async function (assert: Assert) {
      sinon.stub(this.rowsFetcher, 'fetch').callsFake((_: number, _1: number) => {
        return Promise.resolve({ rows: [], meta: { total: 0 } });
      });

      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const handlerSpy = sinon.spy(handler);
      await handler.fetchRows();

      handler.onBottomReached();

      assert.ok(handlerSpy.fetchRows.calledOnce);
    });

    test('it calls the Handler#fetchRows method if there are more rows to be fetched', async function (assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const handlerSpy = sinon.spy(handler);
      await handler.fetchRows();
      handler.onBottomReached();

      assert.ok(handlerSpy.fetchRows.calledTwice);
    });
  });
});
