import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';
import click from '@ember/test-helpers/dom/click';

module('Integration | Component | hyper-table-v2/filtering-renderers/common/column-actions', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [
          buildColumn('static', {
            type: 'text',
            size: FieldSize.Large,
            filterable: true,
            orderable: true,
            position: { sticky: true }
          }),
          buildColumn('Name', { type: 'text', size: FieldSize.Large, filterable: true, orderable: true })
        ]
      });
    });

    await this.handler.fetchColumns();
    this.column = this.handler.columns[1];
  });

  test('it renders', async function (assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::ColumnActions @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.upf-btn').exists({ count: 2 });
    assert.dom('.upf-btn--destructive').exists();
    assert.dom('.upf-btn--default').exists();
  });

  test('The remove button is not displayed if it is a sticky column', async function (assert) {
    this.column = this.handler.columns[0];
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::ColumnActions @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.upf-btn').exists({ count: 1 });
    assert.dom('.upf-btn--destructive').doesNotExist();
    assert.dom('.upf-btn--default').exists();
  });

  test('Clicking on the clear button calls the #handler.resetColumns method', async function (assert) {
    const handlerSpy = sinon.spy(this.handler, 'resetColumns');
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::ColumnActions @handler={{this.handler}} @column={{this.column}} />`
    );
    await click('.upf-btn--default');
    assert.ok(handlerSpy.calledOnce);
  });

  test('Clicking on the remove button calls the #handler.removeColumn method', async function (assert) {
    const handlerSpy = sinon.spy(this.handler, 'removeColumn');
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::ColumnActions @handler={{this.handler}} @column={{this.column}} />`
    );
    await click('.upf-btn--destructive');
    assert.ok(handlerSpy.calledOnce);
  });

  test('Clicking on the clear button calls the #handler.triggerEvent with the reset-columns event', async function (assert) {
    const handlerSpy = sinon.spy(this.handler, 'triggerEvent');
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::ColumnActions @handler={{this.handler}} @column={{this.column}} />`
    );
    await click('.upf-btn--default');
    assert.ok(handlerSpy.calledOnceWith('reset-columns'));
  });
});
