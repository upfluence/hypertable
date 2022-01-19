import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2/header-renderers/base', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();
  });

  test('it renders', async function (assert) {
    this.column = this.handler.columns[0];

    await render(hbs`<HyperTableV2::HeaderRenderers::Base @handler={{this.handler}} @column={{this.column}} />`);

    assert.equal(this.column.definition.key, 'foo');
    assert.dom().hasText('Name: foo');
  });
});
