import { click, render, type TestContext } from '@ember/test-helpers';

import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';

module('Integration | Component | hyper-table-v2/filtering-renderers/text', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [
          buildColumn('static', { type: 'text', size: FieldSize.Large, filterable: true, orderable: true }),
          buildColumn('foo', { size: FieldSize.Large, filterable: true, orderable: true })
        ]
      });
    });

    await this.handler.fetchColumns();

    this.column = this.handler.columns[1];
  });

  test('it has the right data-control-name', async function (assert: Assert) {
    await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

    assert.dom('div[data-control-name="hypertable__column_filtering_for_foo"]').exists();
  });

  module('ordering', function () {
    test('it does not render the section if the column is not orderable', async function (this: TestContext, assert: Assert) {
      this.column.definition.orderable = false;

      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_foo_ordering"]').doesNotExist();
    });

    test('it renders if the column is orderable', async function (assert) {
      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_foo_ordering"]').exists();
    });

    test('it calls the Handler#applyOrder method correctly via the radio buttons', async function (this: TestContext, assert: Assert) {
      const applyOrderSpy = sinon.spy(this.handler, 'applyOrder');
      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.strictEqual(this.column.order, undefined);
      await click(
        'div[data-control-name="hypertable__column_filtering_for_foo_ordering"] .oss-toggle-buttons-btn:nth-child(1)'
      );

      assert.ok(applyOrderSpy.calledWith(this.column, 'asc'));
      assert.deepEqual(this.column.order, {
        direction: 'asc',
        key: 'foo'
      });

      await click(
        'div[data-control-name="hypertable__column_filtering_for_foo_ordering"] .oss-toggle-buttons-btn:nth-child(2)'
      );

      assert.ok(applyOrderSpy.calledWith(this.column, 'desc'));
      assert.deepEqual(this.column.order, {
        direction: 'desc',
        key: 'foo'
      });
    });
  });

  module('filtering', function () {
    test('it does not render the section if the column is not filterable', async function (this: TestContext, assert: Assert) {
      this.column.definition.filterable = false;

      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_foo_filters"]').doesNotExist();
    });

    test('it renders if the column is filterable', async function (assert) {
      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_foo_filters"]').exists();
    });
  });

  module('clear column', function () {
    test('it calls the Handler#resetColumns with the column when the dedicated button is clicked', async function (this: TestContext, assert: Assert) {
      const resetColumnsSpy = sinon.spy(this.handler, 'resetColumns');
      this.handler.applyFilters(this.column, [{ key: 'foo', value: 'bar' }]);
      this.handler.applyOrder(this.column, 'asc');

      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);
      await click('[data-control-name="hypertable__column_filtering_for_foo_clear_filters"]');

      assert.ok(resetColumnsSpy.calledWith([this.column]));
      assert.strictEqual(this.column.order, undefined);
      assert.deepEqual(this.column.filters, []);
    });
  });

  module('remove column', function () {
    test('it calls the Handler#removeColumn with the column when the dedicated button is clicked', async function (this: TestContext, assert: Assert) {
      const removeColumnSpy = sinon.spy(this.handler, 'removeColumn');

      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);
      await click('[data-control-name="hypertable__column_filtering_for_foo_remove_column"]');

      assert.ok(removeColumnSpy.calledWith(this.column.definition));
    });
  });
});
