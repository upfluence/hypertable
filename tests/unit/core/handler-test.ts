import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { getContext } from '@ember/test-helpers';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { FieldSize, Row } from '@upfluence/hypertable/core/interfaces';
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
    assert.equal(handler.columns.length, 4);
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
      orderable_by: [],
      filterable: false,
      filterable_by: [],
      facetable: false,
      facetable_by: ['value']
    });

    assert.equal(handler.columns.length, 1);
    assert.equal(handler.columns[0].definition.key, 'foo');
  });

  module('Handler#removeColumn', function () {
    test('when filter is empty', async function (assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const handlerTriggerEventSpy = sinon.spy(handler, 'triggerEvent');
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
            orderable_by: [],
            filterable: false,
            filterable_by: [],
            facetable: false,
            facetable_by: ['value']
          },
          filters: []
        }
      ];

      assert.equal(handler.columns.length, 1);
      await handler.removeColumn(handler.columns[0].definition);
      assert.equal(handler.columns.length, 0);
      // @ts-ignore
      assert.ok(handlerTriggerEventSpy.notCalled);
    });

    test('when filters is present', async function (assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const handlerTriggerEventSpy = sinon.spy(handler, 'triggerEvent');
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
            orderable_by: [],
            filterable: false,
            filterable_by: [],
            facetable: false,
            facetable_by: ['value']
          },
          filters: [{ key: 'value', value: '3' }]
        }
      ];

      assert.equal(handler.columns.length, 1);
      await handler.removeColumn(handler.columns[0].definition);
      assert.equal(handler.columns.length, 0);
      // @ts-ignore
      assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('remove-column'));
    });
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

    test('new filters trigger event with the apply-filters event', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler, 'triggerEvent');
      await this.handler.applyFilters(this.handler.columns[0], [{ key: 'foo', value: 'bar' }]);

      assert.ok(
        handlerSpy.calledOnceWithExactly('apply-filters', this.handler.columns[0], [{ key: 'foo', value: 'bar' }])
      );
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

  test('Handler#resetRows', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const rowsFetcherSpy = sinon.spy(this.rowsFetcher);

    await handler.fetchRows();
    await handler.resetRows();

    // @ts-ignore
    assert.ok(rowsFetcherSpy.fetch.calledTwice);
    // @ts-ignore
    assert.ok(rowsFetcherSpy.fetch.calledWithExactly(1, 20));
    assert.equal(handler.rows.length, 2);
  });

  test('Handler#removeRow', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const handlerTriggerEventSpy = sinon.spy(handler, 'triggerEvent');

    await handler.fetchRows();
    assert.equal(handler.rows.length, 2);

    handler.removeRow(12);
    assert.equal(handler.rows.length, 1);
    assert.equal(handler.rows[0].recordId, 13);
    // @ts-ignore
    assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('remove-row'));
  });

  test('Handler#mutateRows', async function (assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const handlerTriggerEventSpy = sinon.spy(handler, 'triggerEvent');

    await handler.fetchRows();

    let didRefresh = handler.mutateRow(12, (row: Row) :boolean => {
      row.bar = 'woop woop'
      return true
    });

    assert.equal(handler.rows[0].bar, 'woop woop');
    // @ts-ignore
    assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('mutate-rows'));
    assert.true(didRefresh);

    didRefresh = handler.mutateRow(13, () :boolean => false);
    assert.equal(handler.rows[1].bar, 'second bar');
    // @ts-ignore
    assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('mutate-rows'));
    assert.false(didRefresh);
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

    handler.updateSelection(handler.rows[0]);
    assert.deepEqual(handler.selection, [handler.rows[0]]);

    handler.updateSelection(handler.rows[0]);
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

  module('Handler#fetchFacets', function () {
    test('it calls the fetchFacets method of the manager correctly', async function (assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const tableManagerSpy = sinon.spy(this.tableManager);
      const resp = await handler.fetchFacets('foo', 'id');

      // @ts-ignore
      assert.ok(tableManagerSpy.fetchFacets.calledOnceWithExactly('foo', 'id', undefined));
      assert.deepEqual(resp, {
        facets: [
          {
            identifier: 'band:1',
            payload: {
              name: 'The Foo Fighters'
            },
            count: 4
          }
        ],
        filtering_key: 'id'
      });
    });
  });

  module('Events', function () {
    test('callbacks are called properly when an event is subscribed to', function (assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);

      handler.on('row-click', (row: Row) => {
        assert.equal(row, handler.rows[0]);
      });

      handler.triggerEvent('row-click', handler.rows[0]);
      assert.expect(1);
    });
  });
});
