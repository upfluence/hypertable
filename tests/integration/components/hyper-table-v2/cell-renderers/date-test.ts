import { render, type TestContext } from '@ember/test-helpers';

import { DEFAULT_DATE_FORMAT } from '@upfluence/oss-components/utils/constants';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { module, test } from 'qunit';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2/cell-renderers/date', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();
    await this.handler.fetchRows();
  });

  test('it renders', async function (this: TestContext, assert) {
    this.column = this.handler.columns[3];
    this.row = this.handler.rows[0];

    await render(
      hbs`<HyperTableV2::CellRenderers::Date @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.strictEqual(this.column.definition.key, 'date');
    assert.strictEqual(this.row[this.column.definition.key], 1643386394);
    assert.dom().hasText(moment.unix(this.row[this.column.definition.key]).format(DEFAULT_DATE_FORMAT));
  });

  test('it renders a default - when the value is null', async function (this: TestContext, assert) {
    this.column = this.handler.columns[3];
    this.row = this.handler.rows[1];

    await render(
      hbs`<HyperTableV2::CellRenderers::Date @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.strictEqual(this.column.definition.key, 'date');
    assert.strictEqual(this.row[this.column.definition.key], 0);
    assert.dom().hasText('—');
  });

  test('it renders @column.definition.empty_state_message when present and the value is null', async function (this: TestContext, assert) {
    this.column = this.handler.columns[3];
    this.column.definition.empty_state_message = 'No date';
    this.row = this.handler.rows[1];

    await render(
      hbs`<HyperTableV2::CellRenderers::Date @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.dom().hasText('No date');
  });
});
