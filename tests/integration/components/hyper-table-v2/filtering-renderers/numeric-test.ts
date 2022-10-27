import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerKeyEvent, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';

module('Integration | Component | hyper-table-v2/filtering-renderers/numeric', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [
          buildColumn('static', { type: 'text', size: FieldSize.Large, filterable: true, orderable: true }),
          buildColumn('total', { type: 'integer', size: FieldSize.Large, filterable: true, orderable: true })
        ]
      });
    });

    await this.handler.fetchColumns();

    this.column = this.handler.columns[1];
  });

  test('it has the right data-control-name', async function (assert: Assert) {
    await render(hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`);

    assert.dom('div[data-control-name="hypertable__column_filtering_for_total"]').exists();
  });

  module('ordering', function () {
    test('it does not render the section if the column is not orderable', async function (assert: Assert) {
      this.column.definition.orderable = false;

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );

      assert.dom('div[data-control-name="hypertable__column_filtering_for_total_ordering"]').doesNotExist();
    });

    test('it renders if the column is orderable', async function (assert) {
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );

      assert.dom('div[data-control-name="hypertable__column_filtering_for_total_ordering"]').exists();
    });

    test('it calls the Handler#applyOrder method correctly via the radio buttons', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );

      assert.equal(this.column.order, undefined);
      await click(
        'div[data-control-name="hypertable__column_filtering_for_total_ordering"] .upf-radio-btn:first-child '
      );

      //@ts-ignore
      assert.ok(handlerSpy.applyOrder.calledWith(this.column, 'asc'));
      assert.deepEqual(this.column.order, {
        direction: 'asc',
        key: 'total'
      });

      await click(
        'div[data-control-name="hypertable__column_filtering_for_total_ordering"] .upf-radio-btn:last-child '
      );

      //@ts-ignore
      assert.ok(handlerSpy.applyOrder.calledWith(this.column, 'desc'));
      assert.deepEqual(this.column.order, {
        direction: 'desc',
        key: 'total'
      });
    });
  });

  module('filtering', function () {
    test('it does not render the section if the column is not filterable', async function (assert: Assert) {
      this.column.definition.filterable = false;

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );

      assert.dom('div[data-control-name="hypertable__column_filtering_for_total_existence_selector"]').doesNotExist();
    });

    test('it renders if the column is filterable', async function (assert) {
      this.column.definition.filterable = true;

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );
      assert.dom('div[data-control-name="hypertable__column_filtering_for_total_existence_selector"]').exists();
    });

    test('it handles with or without value options properly', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );

      await click(
        'div[data-control-name="hypertable__column_filtering_for_total_existence_selector"] .fx-row:first-child .oss-radio-btn'
      );
      //@ts-ignore
      assert.ok(handlerSpy.applyFilters.calledWith(this.column, [{ key: 'existence', value: 'with' }]));
      assert.deepEqual(this.column.filters, [
        {
          key: 'existence',
          value: 'with'
        }
      ]);

      await click(
        'div[data-control-name="hypertable__column_filtering_for_total_existence_selector"] .fx-row:last-child .oss-radio-btn'
      );
      //@ts-ignore
      assert.ok(handlerSpy.applyFilters.calledWith(this.column, [{ key: 'existence', value: 'without' }]));
      assert.deepEqual(this.column.filters, [
        {
          key: 'existence',
          value: 'without'
        }
      ]);
    });

    test('it triggers applyFilter when the range values are changed', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      //@ts-ignore
      Ember.run.debounce = function (target: () => {}, func: () => {}) {
        func.call(target);
      };
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );

      await fillIn('[data-control-name="hypertable__column_filtering_for_total_range_from"]', '1');
      await triggerKeyEvent(
        '[data-control-name="hypertable__column_filtering_for_total_range_from"]',
        'keydown',
        'Enter',
        //@ts-ignore
        { code: 'Enter' }
      );
      assert.ok(
        //@ts-ignore
        handlerSpy.applyFilters.calledWith(this.column, [{ key: 'lower_bound', value: '1' }])
      );

      await fillIn('[data-control-name="hypertable__column_filtering_for_total_range_to"]', '9');
      await triggerKeyEvent(
        '[data-control-name="hypertable__column_filtering_for_total_range_to"]',
        'keydown',
        'Enter',
        //@ts-ignore
        { code: 'Enter' }
      );

      assert.ok(
        //@ts-ignore
        handlerSpy.applyFilters.calledWith(this.column, [
          { key: 'lower_bound', value: '1' },
          { key: 'upper_bound', value: '9' }
        ])
      );
    });

    module('with existing range value', function () {
      test('it display range value', async function (assert: Assert) {
        this.column.filters = [
          { key: 'lower_bound', value: '10' },
          { key: 'upper_bound', value: '1000' }
        ];

        await render(
          hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
        );

        assert.dom('[data-control-name="hypertable__column_filtering_for_total_range_from"]').hasValue('10');
        assert.dom('[data-control-name="hypertable__column_filtering_for_total_range_to"]').hasValue('1000');
      });
    });
  });

  module('clear column', async function () {
    test('it calls the Handler#resetColumns with the column when the dedicated button is clicked', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      this.handler.applyFilters(this.column, [{ key: 'lower_bound', value: '10' }]);
      this.handler.applyOrder(this.column, 'asc');

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );
      await click('[data-control-name="hypertable__column_filtering_for_total_clear_filters"]');

      //@ts-ignore
      assert.ok(handlerSpy.resetColumns.calledWith([this.column]));
      assert.equal(this.column.order, undefined);
      assert.deepEqual(this.column.filters, []);
    });
  });

  module('remove column', function () {
    test('it calls the Handler#removeColumn with the column when the dedicated button is clicked', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Numeric @handler={{this.handler}} @column={{this.column}} />`
      );
      await click('[data-control-name="hypertable__column_filtering_for_total_remove_column"]');

      //@ts-ignore
      assert.ok(handlerSpy.removeColumn.calledWith(this.column.definition));
    });
  });
});
