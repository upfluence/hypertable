import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Row } from '@upfluence/hypertable/core/interfaces';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

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

  test('it triggers the onRowClick action correctly', async function (assert: Assert) {
    this.onRowClick = (row: Row) => {
      assert.equal(row, this.handler.rows[0]);
    };

    await render(hbs`<HyperTableV2 @handler={{this.handler}} @onRowClick={{this.onRowClick}} />`);
    await click('.hypertable__sticky-columns > .hypertable__column .hypertable__cell');

    assert.expect(1);
  });

  module('empty state', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(this.rowsFetcher, 'fetch').callsFake((_: number, _1: number) => {
        return Promise.resolve({ rows: [], meta: { total: 0 } });
      });
    });

    test('it displays the default empty state if there is no named block passed', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

      assert.dom('.hypertable__state.hypertable__state--empty').exists();
      assert.dom('.hypertable__state.hypertable__state--empty img').exists();
      assert
        .dom('.hypertable__state.hypertable__state--empty img')
        .hasAttribute('src', '/@upfluence/hypertable/assets/images/empty-state.png');
    });

    test('it displays the empty state named block if passed', async function (assert: Assert) {
      await render(hbs`
        <HyperTableV2 @handler={{this.handler}}>
          <:empty-state>
            <div class="custom-empty-state">foo</div>
          </:empty-state>
        </HyperTableV2>
      `);

      assert.dom('.hypertable__state.hypertable__state--empty').exists();
      assert.dom('.hypertable__state.hypertable__state--empty .custom-empty-state').exists();
      assert.dom('.hypertable__state.hypertable__state--empty .custom-empty-state').hasText('foo')
    });
  });
});
