import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2/cell-renderers/text', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();
    await this.handler.fetchRows();
  });

  test('it renders', async function (assert) {
    this.column = this.handler.columns[0];
    this.row = this.handler.rows[0];

    await render(
      hbs`<HyperTableV2::CellRenderers::Text @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.equal(this.column.definition.key, 'foo');
    assert.equal(this.row[this.column.definition.key], 'ekip');
    assert.dom().hasText('ekip');
  });
});
