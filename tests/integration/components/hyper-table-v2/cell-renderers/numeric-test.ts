import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2/cell-renderers/numeric', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();
    await this.handler.fetchRows();
  });

  test('it renders', async function (assert) {
    this.column = this.handler.columns[2];
    this.row = this.handler.rows[0];

    await render(
      hbs`<HyperTableV2::CellRenderers::Numeric @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.equal(this.column.definition.key, 'total');
    assert.equal(this.row[this.column.definition.key], '123');
    assert.dom().hasText('123');
  });

  test('it renders and rounds up the value', async function (assert) {
    this.column = this.handler.columns[2];
    this.row = this.handler.rows[1];

    await render(
      hbs`<HyperTableV2::CellRenderers::Numeric @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.equal(this.column.definition.key, 'total');
    assert.equal(this.row[this.column.definition.key], '123123');
    assert.dom().hasText('123k');
  });
});
