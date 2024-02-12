import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, fillIn, render, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';
import settled from '@ember/test-helpers/settled';

module('Integration | Component | hyper-table-v2/filtering-renderers/common/search', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [buildColumn('Name', { type: 'text', size: FieldSize.Large, filterable: true, orderable: true })]
      });
    });

    await this.handler.fetchColumns();

    this.column = this.handler.columns[0];
  });

  test('it has the right data-control-name', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Search @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.oss-input-container').exists();
  });

  test('When text is inputed, the applyFilters is called', async function (assert: Assert) {
    const handlerSpy = sinon.spy(this.handler);
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Search @handler={{this.handler}} @column={{this.column}} />`
    );

    await fillIn('.oss-input-container input', 'test');
    await triggerKeyEvent(
      '.oss-input-container input',
      'keyup',
      'Enter',
      //@ts-ignore
      { code: 'Enter' }
    );

    assert.ok(
      //@ts-ignore
      handlerSpy.applyFilters.calledWith(this.column, [
        {
          key: 'value',
          value: 'test'
        }
      ])
    );
  });

  test('The remove icon is displayed when text is entered', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Search @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.oss-input-container').exists();
    await fillIn('.oss-input-container input', 'test');
    assert.dom('.oss-input-container .suffix .fa-times').exists();
  });

  test('The remove icon is hidden when the input is empty', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Search @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.oss-input-container').exists();
    assert.dom('.oss-input-container .suffix .fa-times').doesNotExist();
  });

  test('When the remove icon is clicked, the text input is cleared, #handler.applyFilters is triggered', async function (assert: Assert) {
    const handlerSpy = sinon.spy(this.handler);
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Search @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.oss-input-container').exists();
    await fillIn('.oss-input-container input', 'test');
    await click('.oss-input-container .suffix .fa-times');
    assert.ok(
      //@ts-ignore
      handlerSpy.applyFilters.calledWith(this.column, [
        {
          key: 'value',
          value: ''
        }
      ])
    );
  });

  test('When the parent triggers the reset event, the text input is cleared', async function (assert: Assert) {
    await render(
      hbs`<HyperTableV2::FilteringRenderers::Common::Search @handler={{this.handler}} @column={{this.column}} />`
    );
    assert.dom('.oss-input-container').exists();
    await fillIn('.oss-input-container input', 'test');
    assert.dom('.oss-input-container input').hasValue('test');
    await settled();
    this.handler.resetColumns([this.column]);
    await settled();
    assert.dom('.oss-input-container input').hasValue('');
  });
});
