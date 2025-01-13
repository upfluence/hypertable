import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, type TestContext } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2/cell-renderers/numeric', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();
    await this.handler.fetchRows();
  });

  test('it renders', async function (this: TestContext, assert) {
    this.column = this.handler.columns[2];
    this.row = this.handler.rows[0];

    await render(
      hbs`<HyperTableV2::CellRenderers::Numeric @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.equal(this.column.definition.key, 'total');
    assert.equal(this.row[this.column.definition.key], '123');
    assert.dom().hasText('123');
  });

  test('it renders and rounds up the value', async function (this: TestContext, assert) {
    this.column = this.handler.columns[2];
    this.row = this.handler.rows[1];

    await render(
      hbs`<HyperTableV2::CellRenderers::Numeric @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.equal(this.column.definition.key, 'total');
    assert.equal(this.row[this.column.definition.key], '123123');
    assert.dom().hasText('123k');
  });

  test('it renders a default - when the value is null', async function (this: TestContext, assert) {
    this.column = this.handler.columns[2];
    this.row = this.handler.rows[2];

    await render(
      hbs`<HyperTableV2::CellRenderers::Numeric @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.dom().hasText('—');
  });

  test('it renders @column.definition.empty_state_message when present and the value is null', async function (this: TestContext, assert) {
    this.column = this.handler.columns[2];
    this.column.definition.empty_state_message = 'Custom empty';
    this.row = this.handler.rows[2];

    await render(
      hbs`<HyperTableV2::CellRenderers::Numeric @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
    );

    assert.dom().hasText('Custom empty');
  });
});
