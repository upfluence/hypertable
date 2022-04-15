import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';

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
    assert.dom('span').hasText('ekip');
  });

  [
    { size: [FieldSize.ExtraSmall], expectedEllipsisClass: 'text-ellipsis-100' },
    { size: [FieldSize.Small], expectedEllipsisClass: 'text-ellipsis-160' },
    { size: [FieldSize.Medium], expectedEllipsisClass: 'text-ellipsis-240' },
    { size: [FieldSize.Large], expectedEllipsisClass: 'text-ellipsis-340' },
    { size: [FieldSize.ExtraLarge], expectedEllipsisClass: 'text-ellipsis-400' }
  ].forEach((testCase) => {
    test(`it has the correct ellipsis class when column size is: ${testCase.size}`, async function (assert: Assert) {
      this.column = this.handler.columns[0];
      this.column.definition.size = testCase.size;
      this.row = this.handler.rows[0];

      await render(
        hbs`<HyperTableV2::CellRenderers::Text @handler={{this.handler}} @row={{this.row}} @column={{this.column}} />`
      );

      assert.dom('span').hasClass(testCase.expectedEllipsisClass);
    });
  });
});
