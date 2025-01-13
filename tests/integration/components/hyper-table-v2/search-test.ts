import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, fillIn, render, triggerKeyEvent, type TestContext } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';

module('Integration | Component | hyper-table-v2/search', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function (this: TestContext) {
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

  test('It renders', async function (assert) {
    await render(hbs`<HyperTableV2::Search @handler={{this.handler}} />`);
    assert.dom('[data-control-name="table_search_input"]').exists();
  });

  test('The input has a search icon prefix', async function (assert) {
    await render(hbs`<HyperTableV2::Search @handler={{this.handler}} />`);
    assert.dom('.prefix .fa-search').exists();
  });

  module('When text is inserted in the input', () => {
    test('The handler.applyFilters is called', async function (this: TestContext, assert) {
      const handlerSpy = sinon.spy(this.handler);

      await render(hbs`<HyperTableV2::Search @handler={{this.handler}} />`);
      await fillIn('.oss-input-container input', 'test');
      await triggerKeyEvent(
        '.oss-input-container input',
        'keyup',
        'Enter',
        //@ts-ignore
        { code: 'Enter' }
      );
      // @ts-ignore
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

    test('The input has a clear search icon suffix', async function (assert) {
      await render(hbs`<HyperTableV2::Search @handler={{this.handler}} />`);
      await fillIn('.oss-input-container input', 'test');
      assert.dom('.suffix .fa-times').exists();
    });

    test('When the remove icon is clicked, the text input is cleared, #handler.applyFilters is triggered', async function (this: TestContext, assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(hbs`<HyperTableV2::Search @handler={{this.handler}} />`);
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
  });

  test('The remove icon is hidden when the input is empty', async function (assert) {
    await render(hbs`<HyperTableV2::Search @handler={{this.handler}} />`);
    assert.dom('.oss-input-container').exists();
    assert.dom('.oss-input-container .suffix .fa-times').doesNotExist();
  });

  module('Placeholder management', () => {
    test('When the @placeholder parameter is filled, it is used as placeholder', async function (assert) {
      await render(hbs`<HyperTableV2::Search @handler={{this.handler}} @placeholder="placeholder from parameter" />`);

      assert.dom('.oss-input-container input').hasAttribute('placeholder', 'placeholder from parameter');
    });

    test('if the @placeholder is undefined and the first column definition has a name, its name is used as the placeholder', async function (this: TestContext, assert) {
      this.column.definition.name = 'profile name';
      await render(hbs`<HyperTableV2::Search @handler={{this.handler}} />`);

      assert.dom('.oss-input-container input').hasAttribute('placeholder', 'Search by profile name');
    });

    test('when @placeholder is undefined and the first column definition does not have a name value, the default label is used as placeholder', async function (this: TestContext, assert) {
      this.column.definition.name = undefined;
      await render(hbs`<HyperTableV2::Search @handler={{this.handler}} />`);

      assert.dom('.oss-input-container input').hasAttribute('placeholder', 'Search...');
    });
  });
});
