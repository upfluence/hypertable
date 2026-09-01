import { getContext, type TestContext } from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { FieldSize, Row } from '@upfluence/hypertable/core/interfaces';
import BaseRenderingResolver from '@upfluence/hypertable/core/rendering-resolver';
import { TableManager, RowsFetcher, AllRowsFetcher } from '@upfluence/hypertable/test-support';

module('Unit | core/handler', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
  });

  test('it works', function (this: TestContext, assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.ok(handler);
  });

  test('it uses the base rendering resolver when non is passed', function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.ok(handler.renderingResolver instanceof BaseRenderingResolver);
  });

  test('Handler#fetchColumns', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.strictEqual(handler.columns.length, 0);
    await handler.fetchColumns();
    assert.strictEqual(handler.columns.length, 4);
  });

  test('Handler#fetchColumns triggers the columns-loaded event', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const triggerEventSpy = sinon.spy(handler, 'triggerEvent');

    await handler.fetchColumns();

    assert.ok(triggerEventSpy.calledOnceWithExactly('columns-loaded'));
  });

  module('Handler#fetchRows', () => {
    test('it adds the correct number of rows', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      assert.strictEqual(handler.rows.length, 0);
      await handler.fetchRows();
      assert.strictEqual(handler.rows.length, 3);
    });

    test('it removes duplicated row by record_id', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      stubFetchRowForDuplication(handler);
      await handler.fetchRows();
      await handler.fetchRows();

      assert.strictEqual(handler.rows.length, 3);
      assert.strictEqual(handler.rows[0].record_id, 12);
      assert.strictEqual(handler.rows[0].foo, 'ekip');
      assert.strictEqual(handler.rows[1].record_id, 13);
      assert.strictEqual(handler.rows[1].foo, 'second');
      assert.strictEqual(handler.rows[2].record_id, 14);
      assert.strictEqual(handler.rows[2].foo, 'third');
    });
  });

  test('Handler#addColumn', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    assert.strictEqual(handler.columns.length, 0);
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

    assert.strictEqual(handler.columns.length, 1);
    assert.strictEqual(handler.columns[0].definition.key, 'foo');
  });

  module('Handler#removeColumn', function () {
    test('when filter is empty', async function (this: TestContext, assert: Assert) {
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

      assert.strictEqual(handler.columns.length, 1);
      await handler.removeColumn(handler.columns[0].definition);
      assert.strictEqual(handler.columns.length, 0);
      assert.ok(handlerTriggerEventSpy.notCalled);
    });

    test('when filters is present', async function (this: TestContext, assert: Assert) {
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

      assert.strictEqual(handler.columns.length, 1);
      await handler.removeColumn(handler.columns[0].definition);
      assert.strictEqual(handler.columns.length, 0);
      assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('remove-column'));
    });
  });

  module('Handler#applyFilter', function (hooks) {
    hooks.beforeEach(async function (this: TestContext) {
      this.handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await this.handler.fetchColumns();
    });

    test('new filters are added to the column', async function (this: TestContext, assert: Assert) {
      this.handler.columns[0].filters = [{ key: 'fizz', value: 'buzz' }];

      this.handler.applyFilters(this.handler.columns[0], [{ key: 'foo', value: 'bar' }]);

      assert.strictEqual(this.handler.columns[0].filters.length, 2);
      assert.deepEqual(this.handler.columns[0].filters, [
        {
          key: 'fizz',
          value: 'buzz'
        },
        {
          key: 'foo',
          value: 'bar'
        }
      ]);
    });

    test('new filters trigger event with the apply-filters event', async function (this: TestContext, assert: Assert) {
      const triggerEventSpy = sinon.spy(this.handler, 'triggerEvent');
      await this.handler.applyFilters(this.handler.columns[0], [{ key: 'foo', value: 'bar' }]);

      assert.ok(
        triggerEventSpy.calledOnceWithExactly('apply-filters', this.handler.columns[0], [{ key: 'foo', value: 'bar' }])
      );
    });

    test('existing filters are updated if they have the same key', function (this: TestContext, assert: Assert) {
      this.handler.columns[0].filters = [{ key: 'foo', value: 'bar' }];

      this.handler.applyFilters(this.handler.columns[0], [
        { key: 'foo', value: 'batman' },
        { key: 'fizz', value: 'buzz' }
      ]);

      assert.strictEqual(this.handler.columns[0].filters.length, 2);
      assert.deepEqual(this.handler.columns[0].filters, [
        { key: 'foo', value: 'batman' },
        { key: 'fizz', value: 'buzz' }
      ]);
    });

    test('Empty values in filters are cleared', function (this: TestContext, assert: Assert) {
      this.handler.columns[0].filters = [
        { key: 'foo', value: 'bar' },
        { key: 'fizz', value: 'buzz' }
      ];

      this.handler.applyFilters(this.handler.columns[0], [
        { key: 'foo', value: null },
        { key: 'fizz', value: 'buzz' }
      ]);

      assert.strictEqual(this.handler.columns[0].filters.length, 1);
      assert.deepEqual(this.handler.columns[0].filters, [{ key: 'fizz', value: 'buzz' }]);
    });
  });

  module('Handler#resetColumns', function () {
    test('the columns filters are order are properly reset', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchColumns();

      handler.applyFilters(handler.columns[0], [{ key: 'foo', value: 'bar' }]);
      handler.applyOrder(handler.columns[1], 'asc');

      handler.resetColumns(handler.columns);

      assert.strictEqual(handler.columns.filter((column) => column.filters.length > 0 || column.order).length, 0);
      assert.strictEqual(handler.columns[0].filters.length, 0);
      assert.strictEqual(handler.columns[1].order, undefined);
    });

    test('it triggers the reset-columns event', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const triggerEventSpy = sinon.spy(handler, 'triggerEvent');

      await handler.fetchColumns();
      await handler.resetColumns(handler.columns);

      assert.ok(triggerEventSpy.calledWithExactly('reset-columns', handler.columns));
    });

    test('if all items where globally selected, the selection is properly reset', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchColumns();
      await handler.fetchRows();

      handler.applyFilters(handler.columns[0], [{ key: 'foo', value: 'bar' }]);
      handler.applyOrder(handler.columns[1], 'asc');
      handler.selectAllGlobal();

      assert.strictEqual(handler.selection, 'all');

      await handler.resetColumns(handler.columns);

      assert.deepEqual(handler.selection, []);
    });

    test('if a precise selection where done, the selection is properly reset', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchColumns();
      await handler.fetchRows();

      handler.applyFilters(handler.columns[0], [{ key: 'foo', value: 'bar' }]);
      handler.applyOrder(handler.columns[1], 'asc');
      handler.toggleSelectAll(true);

      assert.strictEqual(handler.selection.length, 3);

      handler.resetColumns(handler.columns);

      assert.strictEqual(handler.selection.length, 0);
    });
  });

  test('Handler#resetRows', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const fetchSpy = sinon.spy(this.rowsFetcher, 'fetch');

    await handler.fetchRows();
    await handler.resetRows();

    assert.ok(fetchSpy.calledTwice);
    assert.ok(fetchSpy.calledWithExactly(1, 30));
    assert.strictEqual(handler.rows.length, 3);
  });

  test('Handler#resetRows triggers the reset-rows event', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const triggerEventSpy = sinon.spy(handler, 'triggerEvent');

    await handler.fetchRows();
    await handler.resetRows();

    assert.ok(triggerEventSpy.calledOnceWithExactly('reset-rows'));
  });

  test('Handler#removeRow', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const handlerTriggerEventSpy = sinon.spy(handler, 'triggerEvent');

    await handler.fetchRows();
    assert.strictEqual(handler.rows.length, 3);

    handler.removeRow(12);
    assert.strictEqual(handler.rows.length, 2);
    assert.strictEqual(handler.rows[0].recordId, 13);
    assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('remove-row'));
  });

  test('Handler#mutateRows', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const handlerTriggerEventSpy = sinon.spy(handler, 'triggerEvent');

    await handler.fetchRows();

    let didRefresh = handler.mutateRow(12, (row: Row): boolean => {
      row.bar = 'woop woop';
      return true;
    });

    assert.strictEqual(handler.rows[0].bar, 'woop woop');
    assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('mutate-rows'));
    assert.true(didRefresh);

    didRefresh = handler.mutateRow(13, (): boolean => false);
    assert.strictEqual(handler.rows[1].bar, 'second bar');
    assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('mutate-rows'));
    assert.false(didRefresh);
  });

  test('Handler#applyOrder', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const upsertColumnsSpy = sinon.spy(this.tableManager, 'upsertColumns');

    await handler.fetchColumns();
    handler.applyOrder(handler.columns[0], 'asc');

    assert.ok(upsertColumnsSpy.calledOnceWithExactly({ columns: handler.columns }));
    assert.strictEqual(handler.currentPage, 1);
  });

  test('Handler#applyOrder triggers the apply-order event', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const triggerEventSpy = sinon.spy(handler, 'triggerEvent');

    await handler.fetchColumns();
    await handler.applyOrder(handler.columns[0], 'asc');

    assert.ok(triggerEventSpy.calledWithExactly('apply-order', handler.columns[0], 'asc'));
  });

  module('Handler#toggleSelectAll', () => {
    test('it selects all the loaded rows', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      assert.deepEqual(handler.selection, []);

      await handler.fetchRows();
      handler.toggleSelectAll(true);
      assert.strictEqual(handler.selection.length, 3);
    });

    test('it selects all the rows', async function (this: TestContext, assert: Assert) {
      this.rowsFetcher = new AllRowsFetcher();
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      assert.deepEqual(handler.selection, []);

      await handler.fetchRows();
      handler.toggleSelectAll(true);
      assert.strictEqual(handler.selection, 'all');
    });

    test('it clears the selected rows', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      assert.deepEqual(handler.selection, []);
      await handler.fetchRows();

      handler.toggleSelectAll(true);
      handler.toggleSelectAll(false);

      assert.deepEqual(handler.selection, []);
    });
  });

  test('Handler#selectAllGlobal', async function (this: TestContext, assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    populateSelectionAndExclusionHandler(handler);
    assert.strictEqual(handler.selection.length, 1);
    assert.strictEqual(handler.exclusion.length, 1);

    handler.selectAllGlobal();
    assert.strictEqual(handler.selection, 'all');
    assert.deepEqual(handler.exclusion, []);
  });

  test('Handler#clearSelection', async function (this: TestContext, assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    populateSelectionAndExclusionHandler(handler);
    assert.strictEqual(handler.selection.length, 1);
    assert.strictEqual(handler.exclusion.length, 1);

    handler.clearSelection();
    assert.deepEqual(handler.selection, []);
    assert.deepEqual(handler.exclusion, []);
  });

  test('Handler#updateSelection', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    await handler.fetchRows();

    assert.deepEqual(handler.selection, []);

    handler.updateSelection(handler.rows[0]);
    assert.deepEqual(handler.selection, [handler.rows[0]]);

    handler.updateSelection(handler.rows[0]);
    assert.deepEqual(handler.selection, []);
  });

  module('Handler#onBottomReached', function (hooks) {
    hooks.beforeEach(function (this: TestContext) {
      this.handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      this.fetchRowsSpy = sinon.spy(this.handler, 'fetchRows');
    });

    test('it does nothing if the maximum rows have been loaded already', async function (this: TestContext, assert: Assert) {
      sinon.stub(this.rowsFetcher, 'fetch').callsFake((_: number, _1: number) => {
        return Promise.resolve({ rows: [], meta: { total: 0 } });
      });

      await this.handler.fetchRows();

      this.handler.onBottomReached();

      assert.ok(this.fetchRowsSpy.calledOnce);
    });

    test('it calls the Handler#fetchRows method if there are more rows to be fetched', async function (this: TestContext, assert: Assert) {
      await this.handler.fetchRows();
      this.handler.onBottomReached();

      assert.ok(this.fetchRowsSpy.calledTwice);
    });
  });

  module('Handler#fetchFacets', function () {
    test('it calls the fetchFacets method of the manager correctly', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const fetchFacetsSpy = sinon.spy(this.tableManager, 'fetchFacets');
      const resp = await handler.fetchFacets('foo', 'id');

      assert.ok(fetchFacetsSpy.calledOnceWithExactly('foo', 'id', undefined));
      assert.deepEqual(resp, {
        facets: [
          {
            identifier: 'band:1',
            payload: {
              name: 'The Foo Fighters'
            },
            count: 29
          },
          {
            identifier: 'band:2',
            payload: {
              name: 'Arctic Monkeys'
            },
            count: 4
          }
        ],
        filtering_key: 'id'
      });
    });
  });

  module('Handler#updateRowById', function () {
    test('it skips the row refresh if the record_id is not loaded yet', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const fetchByIdSpy = sinon.spy(this.rowsFetcher, 'fetchById');
      await handler.fetchRows();

      assert.strictEqual(handler.rows.find((r) => r.record_id === 12)!.bar, 'hello');
      await handler.updateRowById(667);

      assert.ok(fetchByIdSpy.notCalled);
      assert.strictEqual(handler.rows.find((r) => r.record_id === 12)!.bar, 'hello');
    });

    test('it calls the updateRowById method of the manager correctly', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const fetchByIdSpy = sinon.spy(this.rowsFetcher, 'fetchById');
      await handler.fetchRows();

      assert.strictEqual(handler.rows.find((r) => r.record_id === 12)!.bar, 'hello');
      await handler.updateRowById(12);

      assert.ok(fetchByIdSpy.calledOnceWithExactly(12));
      assert.strictEqual(handler.rows.find((r) => r.record_id === 12)!.bar, 'world');
    });
  });

  module('Handler#toggleRowLoadingState', function () {
    test('it skips if the record_id is not loaded yet', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchRows();

      assert.strictEqual(handler.rows.find((r) => r.record_id === 12)!._isLoading, undefined);
      await handler.toggleRowLoadingState(667);
      assert.strictEqual(handler.rows.find((r) => r.record_id === 12)!._isLoading, undefined);
    });

    test("calling the method properly updates the row's loading state", async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchRows();

      assert.strictEqual(handler.rows.find((r) => r.record_id === 12)!._isLoading, undefined);
      await handler.toggleRowLoadingState(12);
      assert.true(handler.rows.find((r) => r.record_id === 12)!._isLoading);
    });
  });

  module('Handler#teardown', function () {
    test('the currentPage is properly reset', function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);

      handler.currentPage = 2;
      assert.strictEqual(handler.currentPage, 2);

      handler.teardown();

      assert.strictEqual(handler.currentPage, 1);
    });
  });

  module('Events', function () {
    test('callbacks are called properly when an event is subscribed to', function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      assert.expect(1);
      handler.on('row-click', (row: Row) => {
        assert.strictEqual(row, handler.rows[0]);
      });

      handler.triggerEvent('row-click', handler.rows[0]);
    });
  });

  function populateSelectionAndExclusionHandler(handler: TableHandler): void {
    const row = {
      influencerId: 42,
      recordId: 12,
      record_id: 12,
      holderId: 57,
      holderType: 'list',
      foo: 'ekip',
      bar: 'hello',
      total: 123,
      date: 1643386394
    };
    handler.selection = [row];
    handler.exclusion = [row];
  }

  function stubFetchRowForDuplication(handler: TableHandler): void {
    sinon
      .stub(handler.rowsFetcher, 'fetch')
      .onFirstCall()
      .resolves({
        rows: [
          {
            influencerId: 42,
            recordId: 12,
            record_id: 12,
            holderId: 57,
            holderType: 'list',
            foo: 'ekip',
            bar: 'hello',
            total: 123,
            date: 1643386394
          },
          {
            influencerId: 43,
            recordId: 13,
            record_id: 13,
            holderId: 57,
            holderType: 'list',
            foo: 'second',
            bar: 'second bar',
            total: 123123,
            date: 0
          }
        ],
        meta: { total: 12 }
      })
      .onSecondCall()
      .resolves({
        rows: [
          {
            influencerId: 42,
            recordId: 12,
            record_id: 12,
            holderId: 57,
            holderType: 'list',
            foo: 'second duplication',
            bar: 'duplicate row',
            total: 123,
            date: 1643386394
          },
          {
            influencerId: 44,
            recordId: 14,
            record_id: 14,
            holderId: 69,
            holderType: 'list',
            foo: 'third',
            bar: 'third bar',
            total: 123123,
            date: 0
          }
        ],
        meta: { total: 12 }
      });
  }
});
