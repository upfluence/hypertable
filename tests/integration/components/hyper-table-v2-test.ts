import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this.tableManager, this.rowsFetcher);
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
    assert.dom('.hypertable__sticky-columns .hypertable__column header').hasText('Name: foo (key: foo)');
    assert.dom('.hypertable__column:nth-child(2) header').hasText('Name: bar (key: bar)');
  });

  test('it sets up the rows correctly', async function (assert: Assert) {
    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    assert.dom('.hypertable__cell').exists({ count: 4 });
    assert.dom('.hypertable__sticky-columns .hypertable__column .hypertable__cell').exists({ count: 2 });
    assert.dom('.hypertable__column:nth-child(2) .hypertable__cell').exists({ count: 2 });
  });
});
