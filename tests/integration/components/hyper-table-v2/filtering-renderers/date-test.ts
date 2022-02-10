import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';
import findAll from '@ember/test-helpers/dom/find-all';

module('Integration | Component | hyper-table-v2/filtering-renderers/date', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [
          buildColumn('static', { type: 'text', size: FieldSize.Large, filterable: true, orderable: true }),
          buildColumn('date', { type: 'timestamp', size: FieldSize.Large, filterable: true, orderable: true })
        ]
      });
    });

    await this.handler.fetchColumns();

    this.column = this.handler.columns[1];
  });

  test('it has the right data-control-name', async function (assert: Assert) {
    await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);

    assert.dom('div[data-control-name="hypertable__column_filtering_for_date"]').exists();
  });

  module('ordering', function () {
    test('it does not render the section if the column is not orderable', async function (assert: Assert) {
      this.column.definition.orderable = false;

      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_date_order_by_radiogroup"]').doesNotExist();
    });

    test('it renders if the column is orderable', async function (assert: Assert) {
      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_date_order_by_radiogroup"]').exists();
    });

    test('it calls the Handler#applyOrder method correctly via the radio buttons', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );

      assert.equal(this.column.order, undefined);
      await click(
        'div[data-control-name="hypertable__column_filtering_for_date_ordering"] .upf-radio-btn:first-child '
      );

      //@ts-ignore
      assert.ok(handlerSpy.applyOrder.calledWith(this.column, 'asc'));
      assert.deepEqual(this.column.order, {
        direction: 'asc',
        key: 'date'
      });

      await click('div[data-control-name="hypertable__column_filtering_for_date_ordering"] .upf-radio-btn:last-child ');

      //@ts-ignore
      assert.ok(handlerSpy.applyOrder.calledWith(this.column, 'desc'));
      assert.deepEqual(this.column.order, {
        direction: 'desc',
        key: 'date'
      });
    });
  });

  module('filtering', function () {
    test('it does not render the section if the column is not filterable', async function (assert: Assert) {
      this.column.definition.filterable = false;

      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);

      assert.dom('div[data-control-name="hypertable__column_filtering_for_date_filter_by_radiogroup"]').doesNotExist();
    });

    test('it renders if the column is filterable', async function (assert) {
      this.column.definition.filterable = true;

      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('div[data-control-name="hypertable__column_filtering_for_date_filter_by_radiogroup"]').exists();
    });

    // if selected filter is Moving, it should show the list of selectable times
    test('when the filter is set to Moving, then it should show the list of selectable times', async function (assert: Assert) {
      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);

      await click(
        'div[data-control-name="hypertable__column_filtering_for_date_filter_by_radiogroup"] .upf-radio-btn:first-child'
      );
      let filterOptions = findAll('.filters__option');
      assert.equal(filterOptions.length, 6);
      assert.dom(filterOptions[0]).hasText('Today');
      assert.dom(filterOptions[1]).hasText('Yesterday');
      assert.dom(filterOptions[2]).hasText('This Week');
      assert.dom(filterOptions[3]).hasText('Last Week');
      assert.dom(filterOptions[4]).hasText('This Month');
      assert.dom(filterOptions[5]).hasText('This Year');
    });

    test('when the filter is set to Moving, when clicking on a filter option, applyFilter is triggered', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);

      await click(
        'div[data-control-name="hypertable__column_filtering_for_date_filter_by_radiogroup"] .upf-radio-btn:first-child'
      );
      await click('.filters__option');
      assert.ok(
        //@ts-ignore
        handlerSpy.applyFilters.calledWith(this.column, [{ key: 'value', value: 'today' }])
      );
    });

    test('when the filter is set to Fixed, then it should show an input with the datepicker', async function (assert: Assert) {
      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);

      await click(
        'div[data-control-name="hypertable__column_filtering_for_date_filter_by_radiogroup"] .upf-radio-btn:last-child'
      );
      assert.dom('div[data-control-name="hypertable__column_filtering_for_date_date_range_inputs"]').exists();
    });

    test('clicking in the flatpickr input should open flatpickr', async function (assert: Assert) {
      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);

      await click(
        'div[data-control-name="hypertable__column_filtering_for_date_filter_by_radiogroup"] .upf-radio-btn:last-child'
      );

      await click('div[data-control-name="hypertable__column_filtering_for_date_date_range_inputs"] .upf-input');
      assert.true(document.querySelector('.flatpickr-calendar')?.classList.contains('open'));
    });
  });

  module('clear column', async function () {
    test('it calls the Handler#resetColumns with the column when the dedicated button is clicked', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      this.handler.applyFilters(this.column, [{ key: 'value', value: 'today' }]);
      this.handler.applyOrder(this.column, 'asc');

      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);
      await click('[data-control-name="hypertable__column_filtering_for_date_clear_filters"]');

      //@ts-ignore
      assert.ok(handlerSpy.resetColumns.calledWith([this.column]));
      assert.equal(this.column.order, undefined);
      assert.deepEqual(this.column.filters, []);
    });
  });

  module('remove column', function () {
    test('it calls the Handler#removeColumn with the column when the dedicated button is clicked', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);

      await render(hbs`<HyperTableV2::FilteringRenderers::Date @handler={{this.handler}} @column={{this.column}} />`);
      await click('[data-control-name="hypertable__column_filtering_for_date_remove_column"]');

      //@ts-ignore
      assert.ok(handlerSpy.removeColumn.calledWith(this.column.definition));
    });
  });
});
