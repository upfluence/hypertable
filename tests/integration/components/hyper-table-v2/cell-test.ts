import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import sinon from 'sinon';

module('Integration | Component | hyper-table-v2/cell', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();
    await this.handler.fetchRows();

    this.column = this.handler.columns[0];
    this.row = this.handler.rows[0];
  });

  test('it renders the loading state correctly', async function (assert) {
    await render(hbs`<HyperTableV2::Cell @loading={{true}} />`);
    assert.dom('.hypertable__cell').hasClass('hypertable__cell--loading');
    assert.dom('.hypertable__cell .upf-skeleton-effect').exists();
  });

  test('it looks up the rendering component for the column', async function (assert: Assert) {
    const renderingResolverSpy = sinon.spy(this.handler.renderingResolver);

    await render(hbs`<HyperTableV2::Cell @handler={{this.handler}} @column={{this.column}} @row={{this.row}} />`);

    // @ts-ignore
    assert.ok(renderingResolverSpy.lookupCellComponent.calledOnceWithExactly(this.column.definition));
    assert.dom('.hypertable__cell').hasText('ekip');
  });

  test('the onClick action is called when the cell is clicked', async function (assert: Assert) {
    this.onClick = sinon.stub();
    await render(hbs`
      <HyperTableV2::Cell @handler={{this.handler}} @column={{this.column}} @row={{this.row}} @onClick={{this.onClick}} />
    `);

    await click('.hypertable__cell');

    assert.ok(this.onClick.calledOnce);
  });

  test('the onHover action is called when the cell is hovered with right params', async function (assert: Assert) {
    this.onHover = sinon.stub();

    await render(hbs`
      <HyperTableV2::Cell @handler={{this.handler}} @column={{this.column}} @row={{this.row}} @onHover={{this.onHover}} />
    `);

    await triggerEvent('.hypertable__cell', 'mouseenter');
    assert.ok(this.onHover.calledOnceWithExactly(this.row, true));

    await triggerEvent('.hypertable__cell', 'mouseleave');
    assert.ok(this.onHover.calledTwice);
    assert.ok(this.onHover.calledWithExactly(this.row, false));
  });

  test('the onClick action is never called when a loading cell is clicked', async function (assert: Assert) {
    this.onClick = sinon.stub();
    await render(hbs`<HyperTableV2::Cell @loading={{true}} @onClick={{this.onClick}} />`);

    await click('.hypertable__cell');

    assert.ok(this.onClick.neverCalledWith());
  });
});
