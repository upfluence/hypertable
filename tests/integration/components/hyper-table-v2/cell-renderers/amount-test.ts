import { render, type TestContext } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';

const CELL_SELECTOR = '.fx-row.fx-1.fx-malign-end';

module('Integration | Component | hyper-table-v2/cell-renderers/amount', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);
    this.column = buildColumn('amount', { type: 'money' });
  });

  test('it renders the amount converted from cents', async function (this: TestContext, assert) {
    this.row = { amount: { cents: 10000, currency: 'USD' } };

    await render(
      hbs`<HyperTableV2::CellRenderers::Amount @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.dom(CELL_SELECTOR).hasText('$100');
  });

  test('it renders the amount with the currency of the value', async function (this: TestContext, assert) {
    this.row = { amount: { cents: 10000, currency: 'EUR' } };

    await render(
      hbs`<HyperTableV2::CellRenderers::Amount @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.dom(CELL_SELECTOR).hasText('€100');
  });

  test('it renders a zero amount', async function (this: TestContext, assert) {
    this.row = { amount: { cents: 0, currency: 'USD' } };

    await render(
      hbs`<HyperTableV2::CellRenderers::Amount @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.dom(CELL_SELECTOR).hasText('$0');
  });

  test('it renders the empty state when the value is null', async function (this: TestContext, assert) {
    this.row = { amount: null };

    await render(
      hbs`<HyperTableV2::CellRenderers::Amount @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.dom(CELL_SELECTOR).hasText('—');
  });

  test('it renders the empty state when the key is missing from the row', async function (this: TestContext, assert) {
    this.row = {};

    await render(
      hbs`<HyperTableV2::CellRenderers::Amount @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.dom(CELL_SELECTOR).hasText('—');
  });
});
