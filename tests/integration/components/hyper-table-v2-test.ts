import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Row } from '@upfluence/hypertable/core/interfaces';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';

module('Integration | Component | hyper-table-v2', function (hooks) {
  setupRenderingTest(hooks);
  hooks.beforeEach(function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);
  });

  test('it fetches the columns and rows as expected', async function (assert) {
    const handlerSpy = sinon.spy(this.handler);

    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    // @ts-ignore
    assert.ok(handlerSpy.fetchColumns.calledOnce);
    // @ts-ignore
    assert.ok(handlerSpy.fetchRows.calledOnce);
  });

  test('it sets up the columns correctly', async function (assert: Assert) {
    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    assert.dom('.hypertable').exists();
    assert.dom('.hypertable__column').exists({ count: 2 });

    assert.dom('.hypertable__sticky-columns .hypertable__column').exists({ count: 1 });
    assert.dom('.hypertable__sticky-columns .hypertable__column header').hasText('Name: foo');
    assert.dom('.hypertable__column:nth-child(2) header').hasText('Name: bar');
  });

  test('it sets up the rows correctly', async function (assert: Assert) {
    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    assert.dom('.hypertable__cell').exists({ count: 4 });
    assert.dom('.hypertable__sticky-columns .hypertable__column .hypertable__cell').exists({ count: 2 });
    assert.dom('.hypertable__column:nth-child(2) .hypertable__cell').exists({ count: 2 });
  });

  test('it resets the filters', async function (assert: Assert) {
    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [
          buildColumn('foo', { filters: [{ key: 'filter1', value: 'toto' }] }),
          buildColumn('foo', { filters: [{ key: 'filter2', value: 'foo' }] })
        ]
      });
    });
    await this.handler.fetchColumns();

    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    assert.deepEqual(this.handler.columns[0].filters, [{ key: 'filter1', value: 'toto' }]);
    assert.deepEqual(this.handler.columns[1].filters, [{ key: 'filter2', value: 'foo' }]);

    await click('[data-control-name="hypertable_reset_filters_button"]');

    assert.deepEqual(this.handler.columns[0].filters, []);
    assert.deepEqual(this.handler.columns[1].filters, []);
  });

  test('it triggers the onRowClick action correctly', async function (assert: Assert) {
    this.onRowClick = (row: Row) => {
      assert.equal(row, this.handler.rows[0]);
    };

    await render(hbs`<HyperTableV2 @handler={{this.handler}} @onRowClick={{this.onRowClick}} />`);
    await click('.hypertable__sticky-columns > .hypertable__column .hypertable__cell');

    assert.expect(1);
  });
});
