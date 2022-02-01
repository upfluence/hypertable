import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';

module('Integration | Component | hyper-table-v2/filtering-renderers/common/ordering', function (hooks) {
  setupRenderingTest(hooks);

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

  test('it has the right data-control-name', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Ordering @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.btn-group').exists();
  });

  test('it uses the default orderingOptions when no @orderingOptions are passed', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Ordering @handler={{this.handler}} @column={{this.column}} />`
    );

    assert.dom('.btn-group').exists();
    assert.dom('.btn-group .btn').exists({ count: 2 });
    assert.dom('.btn-group .btn:nth-child(1)').hasText('A — Z');
    assert.dom('.btn-group .btn:nth-child(2)').hasText('Z — A');
  });

  test('it properly displays @orderingOptions when they are passed', async function (assert: Assert) {
    this.orderingOptions = {
      'Oldest — Newest': 'asc',
      'Newest — Oldest': 'desc'
    };
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Ordering @handler={{this.handler}} @column={{this.column}}
                                                              @orderingOptions={{this.orderingOptions}} />`
    );

    assert.dom('.btn-group').exists();
    assert.dom('.btn-group .btn').exists({ count: 2 });
    assert.dom('.btn-group .btn:nth-child(1)').hasText('Oldest — Newest');
    assert.dom('.btn-group .btn:nth-child(2)').hasText('Newest — Oldest');
  });

  test('it calls the Handler#applyOrder method correctly via the radio buttons', async function (assert: Assert) {
    const handlerSpy = sinon.spy(this.handler);
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Ordering @handler={{this.handler}} @column={{this.column}} />`
    );

    assert.equal(this.column.order, undefined);

    await click('.upf-radio-btn:first-child');
    //@ts-ignore
    assert.ok(handlerSpy.applyOrder.calledWith(this.column, 'asc'));
    assert.deepEqual(this.column.order, {
      direction: 'asc',
      key: 'date'
    });

    await click('.upf-radio-btn:last-child');
    //@ts-ignore
    assert.ok(handlerSpy.applyOrder.calledWith(this.column, 'desc'));
    assert.deepEqual(this.column.order, {
      direction: 'desc',
      key: 'date'
    });
  });
});
