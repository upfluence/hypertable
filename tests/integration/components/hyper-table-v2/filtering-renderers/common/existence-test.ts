import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';

module('Integration | Component | hyper-table-v2/filtering-renderers/common/existence', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [buildColumn('date', { type: 'timestamp', size: FieldSize.Large, filterable: true, orderable: true })]
      });
    });

    await this.handler.fetchColumns();

    this.column = this.handler.columns[0];
  });

  test('it renders', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Existence @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.oss-radio-btn').exists({ count: 2 });
  });

  test('clicking on the buttons should trigger the applyFilters method', async function (assert: Assert) {
    const handlerSpy = sinon.spy(this.handler);
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Existence @handler={{this.handler}} @column={{this.column}} />`
    );

    await click('.fx-row:first-child .oss-radio-btn');
    // @ts-ignore
    assert.ok(handlerSpy.applyFilters.calledWith(this.column, [{ key: 'existence', value: 'with' }]));

    await click('.fx-row:last-child .oss-radio-btn');
    // @ts-ignore
    assert.ok(handlerSpy.applyFilters.calledWith(this.column, [{ key: 'existence', value: 'without' }]));
  });

  test('cliking on the buttons should trigger the applyFilters method with a custom filtering key', async function (assert: Assert) {
    const handlerSpy = sinon.spy(this.handler);
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Existence @filteringKey="bozo" @handler={{this.handler}} @column={{this.column}} />`
    );

    await click('.fx-row:first-child .oss-radio-btn');
    // @ts-ignore
    assert.ok(handlerSpy.applyFilters.calledWith(this.column, [{ key: 'bozo', value: 'with' }]));

    await click('.fx-row:last-child .oss-radio-btn');
    // @ts-ignore
    assert.ok(handlerSpy.applyFilters.calledWith(this.column, [{ key: 'bozo', value: 'without' }]));
  });

  test('The component should select the proper radiobutton when rendered with a pre-applied filter', async function (assert: Assert) {
    this.column.filters = [{ key: 'bozo', value: 'with' }];
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Existence @handler={{this.handler}} @column={{this.column}} @filteringKey="bozo" />`
    );

    assert.dom('.fx-row:first-child .oss-radio-btn').hasClass('oss-radio-btn--selected');
    assert.dom('.fx-row:last-child .oss-radio-btn').doesNotHaveClass('oss-radio-btn--selected');
  });

  test('if a label is provided, it is displayed', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Existence @handler={{this.handler}} @column={{this.column}} @label="test" />`
    );
    assert.dom('label').exists();
    assert.dom('label').hasText('test');
  });

  test('a default label value is displayed if no custom label is provided', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Existence @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('label').exists();
    assert.dom('label').hasText('Display');
  });

  test('setting the @activateWithValue boolean to true should select the "with" button', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Existence @handler={{this.handler}} @column={{this.column}} @activateWithValue={{true}} />`
    );
    assert.dom('.fx-row:first-child .oss-radio-btn').hasClass('oss-radio-btn--selected');
  });
});
