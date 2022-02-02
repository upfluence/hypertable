import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, triggerKeyEvent, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2/facets-loader', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();

    this.column = this.handler.columns[0];
  });

  module('facet display', function () {
    test('the facets are displayed correctly using the dedicated named block', async function (assert: Assert) {
      await render(
        hbs`
          <HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{false}}>
            <:facet-item as |facetting|>
              {{facetting.facet.payload.name}}
            </:facet-item>
          </HyperTableV2::FacetsLoader>`
      );

      assert.dom('.hypertable__facetting .item').exists({ count: 1 });
      assert.dom('.hypertable__facetting .item').hasText('The Foo Fighters');
    });
  });

  module('facet toggling', function () {
    test('the selected facet is added to the filters if not already present', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);

      await render(
        hbs`<HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{false}}/>`
      );

      assert.dom('.hypertable__facetting .item .upf-checkbox input').isNotChecked();
      await click('.hypertable__facetting .item');
      assert.dom('.hypertable__facetting .item .upf-checkbox input').isChecked();
      //@ts-ignore
      assert.ok(handlerSpy.applyFilters.calledWithExactly(this.column, [{ key: 'foo', value: 'band:1' }]));
    });

    test('the facet is deleted from the filters if already present', async function (assert: Assert) {
      this.column.filters = [{ key: 'foo', value: 'band:1' }];
      const handlerSpy = sinon.spy(this.handler);

      await render(
        hbs`<HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{false}}/>`
      );

      assert.dom('.hypertable__facetting .item .upf-checkbox input').isChecked();
      await click('.hypertable__facetting .item');
      //@ts-ignore
      assert.ok(handlerSpy.applyFilters.calledWithExactly(this.column, [{ key: 'foo', value: '' }]));
    });

    test('facet identifiers that are already in the column are checked by default when rendering', async function (assert: Assert) {
      this.column.filters = [{ key: 'foo', value: 'band:1' }];

      await render(
        hbs`<HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{false}}/>`
      );

      assert.dom('.hypertable__facetting .item .upf-checkbox input').isChecked();
    });
  });

  module('facets search', function () {
    test('the search is not displayed when the searchEnabled argument is falsy', async function (assert: Assert) {
      await render(
        hbs`<HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{false}}/>`
      );

      assert.dom('.oss-input-container').doesNotExist();
    });

    test('the search is displayed when the searchEnabled argument is truthy', async function (assert: Assert) {
      await render(
        hbs`<HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{true}}/>`
      );

      assert.dom('.oss-input-container').exists();
    });

    test('facets are fetched with the typed keyword when searching', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);

      await render(
        hbs`<HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{true}}/>`
      );

      await fillIn('.oss-input-container input', 'test');
      await triggerKeyEvent(
        '.oss-input-container input',
        'keyup',
        'Enter',
        //@ts-ignore
        { code: 'Enter' }
      );

      //@ts-ignore
      assert.ok(handlerSpy.fetchFacets.calledWithExactly(this.column.definition.key, 'foo', 'test'));
    });
  });

  module('empty state', function () {
    test('the default empty state is displayed if there is no named-block passed', async function (assert: Assert) {
      sinon.stub(this.tableManager, 'fetchFacets').callsFake(() => {
        return Promise.resolve({
          facets: [],
          filtering_key: 'foo'
        });
      });

      await render(
        hbs`<HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{true}}/>`
      );

      assert
        .dom('.hypertable__facetting .upf-align--center .text-color-default')
        .hasText('There are no result for your current search.');
      assert
        .dom('.hypertable__facetting .upf-align--center .text-color-default-light')
        .hasText('Please update your filters.');
    });

    test('the empty state named block is displayed if  passed', async function (assert: Assert) {
      sinon.stub(this.tableManager, 'fetchFacets').callsFake(() => {
        return Promise.resolve({
          facets: [],
          filtering_key: 'foo'
        });
      });

      await render(
        hbs`
          <HyperTableV2::FacetsLoader @handler={{this.handler}} @column={{this.column}} @facettingKey="foo" @searchEnabled={{false}}>
            <:facet-item as |facetting|>
              {{facetting.facet.payload.name}}
            </:facet-item>

            <:empty-state>
              nothing here
            </:empty-state>
          </HyperTableV2::FacetsLoader>`
      );

      assert.dom('.hypertable__facetting').hasText('nothing here');
    });
  });
});
