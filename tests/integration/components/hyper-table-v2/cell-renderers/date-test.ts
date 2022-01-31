import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2/cell-renderers/date', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();
    await this.handler.fetchRows();
  });

  test('it renders', async function (assert) {
    this.column = this.handler.columns[3];
    this.row = this.handler.rows[0];

    await render(
      hbs`<HyperTableV2::CellRenderers::Date @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.equal(this.column.definition.key, 'date');
    assert.equal(this.row[this.column.definition.key], '1643386394');
    assert.dom().hasText('January 28, 2022');
  });

  test('it renders a default - when the value is null', async function (assert) {
    this.column = this.handler.columns[3];
    this.row = this.handler.rows[1];

    await render(
      hbs`<HyperTableV2::CellRenderers::Date @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.equal(this.column.definition.key, 'date');
    assert.equal(this.row[this.column.definition.key], '0');
    assert.dom().hasText('—');
  });
});
