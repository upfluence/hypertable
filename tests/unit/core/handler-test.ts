import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { getContext, type TestContext } from '@ember/test-helpers';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { FieldSize, Row } from '@upfluence/hypertable/core/interfaces';
import { TableManager, RowsFetcher, AllRowsFetcher } from '@upfluence/hypertable/test-support';
import BaseRenderingResolver from '@upfluence/hypertable/core/rendering-resolver';

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
    assert.equal(handler.columns.length, 0);
    await handler.fetchColumns();
    assert.equal(handler.columns.length, 4);
  });

  module('Handler#fetchRows', () => {
    test('it adds the correct number of rows', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      assert.equal(handler.rows.length, 0);
      await handler.fetchRows();
      assert.equal(handler.rows.length, 3);
    });

    test('it removes duplicated row by record_id', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      stubFetchRowForDuplication(handler);
      await handler.fetchRows();
      await handler.fetchRows();

      assert.equal(handler.rows.length, 3);
      assert.equal(handler.rows[0].record_id, 12);
      assert.equal(handler.rows[0].foo, 'ekip');
      assert.equal(handler.rows[1].record_id, 13);
      assert.equal(handler.rows[1].foo, 'second');
      assert.equal(handler.rows[2].record_id, 14);
      assert.equal(handler.rows[2].foo, 'third');
    });
  });

  test('Handler#addColumn', async function (this: TestContext, assert: Assert) {
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

      assert.equal(handler.columns.length, 1);
      await handler.removeColumn(handler.columns[0].definition);
      assert.equal(handler.columns.length, 0);
      // @ts-ignore
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

      assert.equal(handler.columns.length, 1);
      await handler.removeColumn(handler.columns[0].definition);
      assert.equal(handler.columns.length, 0);
      // @ts-ignore
      assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('remove-column'));
    });
  });

  module('Handler#applyFilter', function (hooks) {
    hooks.beforeEach(async function (this: TestContext) {
      this.handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await this.handler.fetchColumns();
    });

    test('new filters are added to the column', async function (this: TestContext, assert: Assert) {
      this.handler.applyFilters(this.handler.columns[0], [{ key: 'foo', value: 'bar' }]);

      assert.equal(this.handler.columns[0].filters.length, 1);
      assert.deepEqual(this.handler.columns[0].filters, [
        {
          key: 'foo',
          value: 'bar'
        }
      ]);
    });

    test('new filters trigger event with the apply-filters event', async function (this: TestContext, assert: Assert) {
      const handlerSpy = sinon.spy(this.handler, 'triggerEvent');
      await this.handler.applyFilters(this.handler.columns[0], [{ key: 'foo', value: 'bar' }]);

      assert.ok(
        handlerSpy.calledOnceWithExactly('apply-filters', this.handler.columns[0], [{ key: 'foo', value: 'bar' }])
      );
    });

    test('existing filters are updated if they have the same key', function (this: TestContext, assert: Assert) {
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

  module('Handler#resetColumns', function () {
    test('the columns filters are order are properly reset', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchColumns();

      handler.applyFilters(handler.columns[0], [{ key: 'foo', value: 'bar' }]);
      handler.applyOrder(handler.columns[1], 'asc');

      handler.resetColumns(handler.columns);

      assert.equal(handler.columns.filter((column) => column.filters.length > 0 || column.order).length, 0);
      assert.equal(handler.columns[0].filters.length, 0);
      assert.equal(handler.columns[1].order, undefined);
    });

    test('if all items where globally selected, the selection is properly reset', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchColumns();
      await handler.fetchRows();

      handler.applyFilters(handler.columns[0], [{ key: 'foo', value: 'bar' }]);
      handler.applyOrder(handler.columns[1], 'asc');
      handler.selectAllGlobal();

      assert.equal(handler.selection, 'all');

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

      assert.equal(handler.selection.length, 3);

      handler.resetColumns(handler.columns);

      assert.equal(handler.selection.length, 0);
    });
  });

  test('Handler#resetRows', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const rowsFetcherSpy = sinon.spy(this.rowsFetcher);

    await handler.fetchRows();
    await handler.resetRows();

    // @ts-ignore
    assert.ok(rowsFetcherSpy.fetch.calledTwice);
    // @ts-ignore
    assert.ok(rowsFetcherSpy.fetch.calledWithExactly(1, 20));
    assert.equal(handler.rows.length, 3);
  });

  test('Handler#removeRow', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const handlerTriggerEventSpy = sinon.spy(handler, 'triggerEvent');

    await handler.fetchRows();
    assert.equal(handler.rows.length, 3);

    handler.removeRow(12);
    assert.equal(handler.rows.length, 2);
    assert.equal(handler.rows[0].recordId, 13);
    // @ts-ignore
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

    assert.equal(handler.rows[0].bar, 'woop woop');
    // @ts-ignore
    assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('mutate-rows'));
    assert.true(didRefresh);

    didRefresh = handler.mutateRow(13, (): boolean => false);
    assert.equal(handler.rows[1].bar, 'second bar');
    // @ts-ignore
    assert.ok(handlerTriggerEventSpy.calledOnceWithExactly('mutate-rows'));
    assert.false(didRefresh);
  });

  test('Handler#applyOrder', async function (this: TestContext, assert: Assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    const tableManagerSpy = sinon.spy(this.tableManager);

    await handler.fetchColumns();
    handler.applyOrder(handler.columns[0], 'asc');

    // @ts-ignore
    assert.ok(tableManagerSpy.upsertColumns.calledOnceWithExactly({ columns: handler.columns }));
    assert.equal(handler.currentPage, 1);
  });

  module('Handler#toggleSelectAll', () => {
    test('it selects all the loaded rows', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      assert.deepEqual(handler.selection, []);

      await handler.fetchRows();
      handler.toggleSelectAll(true);
      assert.equal(handler.selection.length, 3);
    });

    test('it selects all the rows', async function (this: TestContext, assert: Assert) {
      this.rowsFetcher = new AllRowsFetcher();
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      assert.deepEqual(handler.selection, []);

      await handler.fetchRows();
      handler.toggleSelectAll(true);
      assert.equal(handler.selection, 'all');
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
    assert.equal(handler.selection.length, 1);
    assert.equal(handler.exclusion.length, 1);

    handler.selectAllGlobal();
    assert.equal(handler.selection, 'all');
    assert.deepEqual(handler.exclusion, []);
  });

  test('Handler#selectAllGlobal', async function (this: TestContext, assert) {
    const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
    populateSelectionAndExclusionHandler(handler);
    assert.equal(handler.selection.length, 1);
    assert.equal(handler.exclusion.length, 1);

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

  module('Handler#onBottomReached', function () {
    test('it does nothing if the maximum rows have been loaded already', async function (this: TestContext, assert: Assert) {
      sinon.stub(this.rowsFetcher, 'fetch').callsFake((_: number, _1: number) => {
        return Promise.resolve({ rows: [], meta: { total: 0 } });
      });

      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const handlerSpy = sinon.spy(handler);
      await handler.fetchRows();

      handler.onBottomReached();

      assert.ok(handlerSpy.fetchRows.calledOnce);
    });

    test('it calls the Handler#fetchRows method if there are more rows to be fetched', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const handlerSpy = sinon.spy(handler);
      await handler.fetchRows();
      handler.onBottomReached();

      assert.ok(handlerSpy.fetchRows.calledTwice);
    });
  });

  module('Handler#fetchFacets', function () {
    test('it calls the fetchFacets method of the manager correctly', async function (this: TestContext, assert: Assert) {
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
      const rowsFetcherSpy = sinon.spy(this.rowsFetcher);
      await handler.fetchRows();

      assert.equal(handler.rows.find((r) => r.record_id === 12)!.bar, 'hello');
      await handler.updateRowById(667);

      // @ts-ignore
      assert.ok(rowsFetcherSpy.fetchById.notCalled);
      assert.equal(handler.rows.find((r) => r.record_id === 12)!.bar, 'hello');
    });

    test('it calls the updateRowById method of the manager correctly', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      const rowsFetcherSpy = sinon.spy(this.rowsFetcher);
      await handler.fetchRows();

      assert.equal(handler.rows.find((r) => r.record_id === 12)!.bar, 'hello');
      await handler.updateRowById(12);

      // @ts-ignore
      assert.ok(rowsFetcherSpy.fetchById.calledOnceWithExactly(12));
      assert.equal(handler.rows.find((r) => r.record_id === 12)!.bar, 'world');
    });
  });

  module('Handler#toggleRowLoadingState', function () {
    test('it skips if the record_id is not loaded yet', async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchRows();

      assert.equal(handler.rows.find((r) => r.record_id === 12)!._isLoading, undefined);
      await handler.toggleRowLoadingState(667);
      assert.equal(handler.rows.find((r) => r.record_id === 12)!._isLoading, undefined);
    });

    test("calling the method properly updates the row's loading state", async function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);
      await handler.fetchRows();

      assert.equal(handler.rows.find((r) => r.record_id === 12)!._isLoading, undefined);
      await handler.toggleRowLoadingState(12);
      assert.equal(handler.rows.find((r) => r.record_id === 12)!._isLoading, true);
    });
  });

  module('Handler#teardown', function () {
    test('the currentPage is properly reset', function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);

      handler.currentPage = 2;
      assert.equal(handler.currentPage, 2);

      handler.teardown();

      assert.equal(handler.currentPage, 1);
    });
  });

  module('Events', function () {
    test('callbacks are called properly when an event is subscribed to', function (this: TestContext, assert: Assert) {
      const handler = new TableHandler(getContext(), this.tableManager, this.rowsFetcher);

      handler.on('row-click', (row: Row) => {
        assert.equal(row, handler.rows[0]);
      });

      handler.triggerEvent('row-click', handler.rows[0]);
      assert.expect(1);
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
