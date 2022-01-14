import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { ColumnDefinition, FieldSize } from '@upfluence/hypertable/core/interfaces';

module('Integration | Component | hyper-table-v2/filtering-renderers/text', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [buildColumn('foo', FieldSize.Large, true, true)]
      });
    });

    await this.handler.fetchColumns();

    this.column = this.handler.columns[0];
  });

  test('it has the right data-control-name', async function (assert: Assert) {
    await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

    assert.dom('div[data-control-name="hypertable__column_filtering_for_foo"]').exists();
  });

  module('ordering', function () {
    test('it does not render the section if the column is not orderable', async function (assert: Assert) {
      this.column.definition.orderable = false;

      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_foo_ordering"]').doesNotExist();
    });

    test('it renders if the column is orderable', async function (assert) {
      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_foo_ordering"]').exists();
    });

    test('it calls the Handler#applyOrder method correctly via the radio buttons', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.equal(this.column.order, undefined);
      await click('div[data-control-name="hypertable__column_filtering_for_foo_ordering"] .upf-radio-btn:first-child ');

      //@ts-ignore
      assert.ok(handlerSpy.applyOrder.calledWith(this.column, 'asc'));
      assert.deepEqual(this.column.order, {
        direction: 'asc',
        key: 'foo'
      });

      await click('div[data-control-name="hypertable__column_filtering_for_foo_ordering"] .upf-radio-btn:last-child ');

      //@ts-ignore
      assert.ok(handlerSpy.applyOrder.calledWith(this.column, 'desc'));
      assert.deepEqual(this.column.order, {
        direction: 'desc',
        key: 'foo'
      });
    });
  });

  module('filtering', function () {
    test('it does not render the section if the column is not orderable', async function (assert: Assert) {
      this.column.definition.filterable = false;

      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_foo_filters"]').doesNotExist();
    });

    test('it renders if the column is orderable', async function (assert) {
      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_foo_filters"]').exists();
    });

    test('it handles search term filters correctly', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);

      await fillIn('div[data-control-name="hypertable__column_filtering_for_foo_filters"] .oss-input-container input', 'bar');

      //@ts-ignore
      assert.ok(handlerSpy.applyFilters.calledWith(this.column, [{ key: 'value', value: 'bar' }]));
      assert.deepEqual(this.column.filters, [
        {
          key: 'value',
          value: 'bar'
        }
      ]);
    });
  });

  module('clear column', async function () {
    test('it calls the Handler#resetColumns with the column when the dedicated button is clicked', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      this.handler.applyFilters(this.column, [{ key: 'foo', value: 'bar' }]);
      this.handler.applyOrder(this.column, 'asc');

      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);
      await click('[data-control-name="hypertable__column_filtering_for_foo_clear_filters"]');

      //@ts-ignore
      assert.ok(handlerSpy.resetColumns.calledWith([this.column]));
      assert.equal(this.column.order, undefined);
      assert.deepEqual(this.column.filters, []);
    });
  });

  module('remove column', function () {
    test('it calls the Handler#removeColumn with the column when the dedicated button is clicked', async function (assert: Assert) {
      this.handler.removeColumn = (_: ColumnDefinition) => {}; // TODO: Remove when there is a proper implementation.
      const handlerSpy = sinon.spy(this.handler);

      await render(hbs`<HyperTableV2::FilteringRenderers::Text @handler={{this.handler}} @column={{this.column}} />`);
      await click('[data-control-name="hypertable__column_filtering_for_foo_remove_column"]');

      //@ts-ignore
      assert.ok(handlerSpy.removeColumn.calledWith(this.column.definition));
    });
  });
});
