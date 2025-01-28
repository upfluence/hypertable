import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, fillIn, triggerKeyEvent, render, type TestContext } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2/facets-loader', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();

    this.column = this.handler.columns[0];
  });

  module('facet display', function () {
    test('the facets are displayed correctly using the dedicated named block & are ordered by count value', async function (this: TestContext, assert: Assert) {
      await render(
        hbs`
          <HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{false}}>
            <:facet-item as |facetting|>
              {{facetting.facet.payload.name}}
            </:facet-item>
          </HyperTableV2::FilteringRenderers::Common::FacetsLoader>`
      );
      // await this.pauseTest();
      assert.dom('.hypertable__facetting .oss-scrollable-panel-content .item').exists({ count: 2 });
      assert
        .dom('.hypertable__facetting .oss-scrollable-panel-content > div:nth-child(1) .item')
        .hasText('The Foo Fighters');
      assert
        .dom('.hypertable__facetting .oss-scrollable-panel-content > div:nth-child(2) .item')
        .hasText('Arctic Monkeys');
    });

    test('the facets are ordered using the @sortCompareFn arg function when provided', async function (this: TestContext, assert: Assert) {
      this.sortCompareFn = sinon.stub().callsFake((a, b) => {
        if (a.payload.name < b.payload.name) return -1;
        if (a.payload.name > b.payload.name) return 1;
        return 0;
      });

      await render(
        hbs`
          <HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{false}} @sortCompareFn={{this.sortCompareFn}}>
            <:facet-item as |facetting|>
              {{facetting.facet.payload.name}}
            </:facet-item>
          </HyperTableV2::FilteringRenderers::Common::FacetsLoader>`
      );

      assert.dom('.hypertable__facetting .item').exists({ count: 2 });
      assert
        .dom('.hypertable__facetting .oss-scrollable-panel-content > div:nth-child(1) .item')
        .hasText('Arctic Monkeys');
      assert
        .dom('.hypertable__facetting .oss-scrollable-panel-content > div:nth-child(2) .item')
        .hasText('The Foo Fighters');

      assert.ok(this.sortCompareFn.calledOnce);
    });
  });

  module('facet toggling', function () {
    test('the selected facet is added to the filters if not already present', async function (this: TestContext, assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{false}}/>`
      );

      assert.dom('.hypertable__facetting .item .upf-checkbox input').isNotChecked();
      await click('.hypertable__facetting .item');
      assert.dom('.hypertable__facetting .item .upf-checkbox input').isChecked();
      //@ts-ignore
      assert.ok(handlerSpy.applyFilters.calledWithExactly(this.column, [{ key: 'value', value: 'band:1' }]));
    });

    test('the facet is deleted from the filters if already present', async function (this: TestContext, assert: Assert) {
      this.column.filters = [{ key: 'value', value: 'band:1' }];
      const handlerSpy = sinon.spy(this.handler);

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{false}}/>`
      );
      assert.dom('.hypertable__facetting .item .upf-checkbox input').isChecked();
      await click('.hypertable__facetting .item');
      //@ts-ignore
      assert.ok(handlerSpy.applyFilters.calledWithExactly(this.column, [{ key: 'value', value: '' }]));
    });

    test('facet identifiers that are already in the column are checked by default when rendering', async function (this: TestContext, assert: Assert) {
      this.column.filters = [{ key: 'value', value: 'band:1' }];

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{false}}/>`
      );

      assert.dom('.hypertable__facetting .item .upf-checkbox input').isChecked();
    });
  });

  module('facets search', function () {
    test('the search is not displayed when the searchEnabled argument is falsy', async function (assert: Assert) {
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{false}}/>`
      );

      assert.dom('.oss-input-container').doesNotExist();
    });

    test('the search is displayed when the searchEnabled argument is truthy', async function (assert: Assert) {
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{true}}/>`
      );

      assert.dom('.oss-input-container').exists();
    });

    test('the default search placeholder is displayed when no searchPlaceholder arg is provided', async function (this: TestContext, assert: Assert) {
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{true}}/>`
      );

      assert.dom('.oss-input-container').exists();
      assert
        .dom('.oss-input-container input')
        .hasAttribute('placeholder', this.intl.t('hypertable.column.filtering.search_term.placeholder'));
    });

    test('the search input has the provided searchPlaceholder arg properly used', async function (assert: Assert) {
      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{true}} @searchPlaceholder="foobar..." />`
      );

      assert.dom('.oss-input-container').exists();
      assert.dom('.oss-input-container input').hasAttribute('placeholder', 'foobar...');
    });

    test('facets are fetched with the typed keyword when searching', async function (this: TestContext, assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{true}}/>`
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
      assert.ok(handlerSpy.fetchFacets.calledWithExactly(this.column.definition.key, 'value', 'test'));
    });
  });

  module('empty state', function () {
    test('the default empty state is displayed if there is no named-block passed', async function (this: TestContext, assert: Assert) {
      sinon.stub(this.tableManager, 'fetchFacets').callsFake(() => {
        return Promise.resolve({
          facets: [],
          filtering_key: 'foo'
        });
      });

      await render(
        hbs`<HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{true}}/>`
      );

      assert
        .dom('.hypertable__facetting .upf-align--center .text-color-default')
        .hasText(this.intl.t('hypertable.column.facetting.empty_state.tagline'));
      assert
        .dom('.hypertable__facetting .upf-align--center .text-color-default-light')
        .hasText('Please update your filters.');
    });

    test('the empty state named block is displayed if  passed', async function (this: TestContext, assert: Assert) {
      sinon.stub(this.tableManager, 'fetchFacets').callsFake(() => {
        return Promise.resolve({
          facets: [],
          filtering_key: 'value'
        });
      });

      await render(
        hbs`
          <HyperTableV2::FilteringRenderers::Common::FacetsLoader @handler={{this.handler}} @column={{this.column}} @searchEnabled={{false}}>
            <:facet-item as |facetting|>
              {{facetting.facet.payload.name}}
            </:facet-item>

            <:empty-state>
              nothing here
            </:empty-state>
          </HyperTableV2::FilteringRenderers::Common::FacetsLoader>`
      );

      assert.dom('.hypertable__facetting').hasText('nothing here');
    });
  });
});
