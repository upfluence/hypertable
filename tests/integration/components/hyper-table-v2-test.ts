import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher, AllRowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';

module('Integration | Component | hyper-table-v2', function (hooks) {
  setupRenderingTest(hooks);
  hooks.beforeEach(function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);
    this.intlService = this.owner.lookup('service:intl');
  });

  test('it fetches the columns and rows as expected', async function (assert) {
    const handlerSpy = sinon.spy(this.handler);

    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    // @ts-ignore
    assert.ok(handlerSpy.fetchColumns.calledOnce);
    // @ts-ignore
    assert.ok(handlerSpy.fetchRows.calledOnce);
  });

  test('it sets up the columns correctly', async function (assert: Assert) {
    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    assert.dom('.hypertable').exists();
    assert.dom('.hypertable__column').exists({ count: 4 });

    assert.dom('.hypertable__sticky-columns .hypertable__column').exists({ count: 1 });
    assert.dom('.hypertable__sticky-columns .hypertable__column header').hasText('Name: foo');
    assert.dom('.hypertable__column:nth-child(2) header').hasText('Name: bar');
  });

  test('it sets up the rows correctly', async function (assert: Assert) {
    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    assert.dom('.hypertable__cell').exists({ count: 8 });
    assert.dom('.hypertable__sticky-columns .hypertable__column .hypertable__cell').exists({ count: 2 });
    assert.dom('.hypertable__column:nth-child(2) .hypertable__cell').exists({ count: 2 });
  });

  test('it resets the filters', async function (assert: Assert) {
    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [
          buildColumn('foo', { filters: [{ key: 'filter1', value: 'toto' }] }),
          buildColumn('foo', { filters: [{ key: 'filter2', value: 'foo' }] })
        ]
      });
    });
    await this.handler.fetchColumns();

    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    assert.deepEqual(this.handler.columns[0].filters, [{ key: 'filter1', value: 'toto' }]);
    assert.deepEqual(this.handler.columns[1].filters, [{ key: 'filter2', value: 'foo' }]);

    await click('[data-control-name="hypertable_reset_filters_button"]');

    assert.deepEqual(this.handler.columns[0].filters, []);
    assert.deepEqual(this.handler.columns[1].filters, []);
  });

  test('it triggers the row-click event correctly', async function (assert: Assert) {
    const handlerSpy = sinon.spy(this.handler);

    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);
    await click('.hypertable__sticky-columns > .hypertable__column .hypertable__cell');

    // @ts-ignore
    assert.ok(handlerSpy.triggerEvent.calledOnceWithExactly('row-click', this.handler.rows[0]));
  });

  module('empty state', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(this.rowsFetcher, 'fetch').callsFake((_: number, _1: number) => {
        return Promise.resolve({ rows: [], meta: { total: 0 } });
      });
    });

    test('it displays the default empty state if there is no named block passed', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

      assert.dom('.hypertable__state.hypertable__state--empty').exists();
      assert.dom('.hypertable__state.hypertable__state--empty img').exists();
      assert
        .dom('.hypertable__state.hypertable__state--empty img')
        .hasAttribute('src', '/@upfluence/hypertable/assets/images/empty-state.png');
    });

    test('it displays the empty state named block if passed', async function (assert: Assert) {
      await render(hbs`
        <HyperTableV2 @handler={{this.handler}}>
          <:empty-state>
            <div class="custom-empty-state">foo</div>
          </:empty-state>
        </HyperTableV2>
      `);

      assert.dom('.hypertable__state.hypertable__state--empty').exists();
      assert.dom('.hypertable__state.hypertable__state--empty .custom-empty-state').exists();
      assert.dom('.hypertable__state.hypertable__state--empty .custom-empty-state').hasText('foo');
    });
  });

  module('error state', function () {
    test('It displays an error state when the fetchRows call fails', async function (assert: Assert) {
      sinon.stub(this.rowsFetcher, 'fetch').callsFake(() => {
        return Promise.reject(new Error());
      });

      await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);
      assert.dom('.hypertable__state .upf-badge--error').exists();
      assert.dom('.hypertable__state').containsText('An unexpected error has occured.');
    });

    test('It displays an error state when the fetchColumns call fails', async function (assert: Assert) {
      sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
        return Promise.reject(new Error());
      });

      await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);
      assert.dom('.hypertable__state .upf-badge--error').exists();
      assert.dom('.hypertable__state').containsText('An unexpected error has occured.');
    });

    test('It displays an error state when the fetchColumnDefinitions call fails', async function (assert: Assert) {
      sinon.stub(this.tableManager, 'fetchColumnDefinitions').callsFake(() => {
        return Promise.reject(new Error());
      });

      await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);
      assert.dom('.hypertable__state .upf-badge--error').exists();
      assert.dom('.hypertable__state').containsText('An unexpected error has occured.');
    });
  });

  module('FeatureSet: selection', function () {
    test('the selection checkboxes are not present if the feature is not enabled', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=false}} />`);

      assert.dom('.hypertable__column.hypertable__column--selection').doesNotExist();
      assert.dom('.selected-count').doesNotExist();
    });

    test('the selection column is present when the feature is enabled', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

      assert.dom('.hypertable__column.hypertable__column--selection').exists();
      assert.dom('.upf-checkbox').exists({ count: 3 });
    });

    test('the selection column is present when the feature is enabled', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

      assert.dom('.selected-count').exists();
    });

    module('when clicking on the select-all checkbox with partial rows loaded', () => {
      test('it triggers the handler SelectAll function', async function (assert: Assert) {
        const toggleSelectAllStub = sinon.stub(this.handler, 'toggleSelectAll');
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

        assert.dom('.hypertable__column.hypertable__column--selection header .upf-checkbox').exists();
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

        assert.ok(toggleSelectAllStub.calledOnceWithExactly(true));
      });

      test('it updates the selected count with correct number', async function (assert: Assert) {
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

        assert.dom('.selected-count').hasText(this.handler.selection.length.toString());
      });

      test('it renders the partial mode for the select-all checkbox', async function (assert: Assert) {
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

        assert
          .dom('.hypertable__column.hypertable__column--selection header .upf-checkbox label')
          .hasClass('upf-checkbox__fake-checkbox--partial');
      });

      test('HyperTableV2::Selection component renders correct value', async function (assert: Assert) {
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

        assert
          .dom('.selection-container .count-container span')
          .hasText(
            this.intlService.t('hypertable.selection.records_selected', { count: this.handler.selection.length })
          );
        assert
          .dom('.selection-container .select-all-container')
          .hasText(this.intlService.t('hypertable.selection.select_all', { count: this.handler.rowsMeta.total }));
      });
    });

    module('when clicking on the select-all checkbox all rows loaded', (hooks) => {
      hooks.beforeEach(function () {
        this.rowsFetcher = new AllRowsFetcher();
        this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);
      });

      test('it triggers the handler SelectAll function', async function (assert: Assert) {
        const toggleSelectAllStub = sinon.stub(this.handler, 'toggleSelectAll');
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

        assert.dom('.hypertable__column.hypertable__column--selection header .upf-checkbox').exists();
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

        assert.ok(toggleSelectAllStub.calledOnceWithExactly(true));
      });

      test('it updates the selected count with correct number', async function (assert: Assert) {
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

        assert.dom('.selected-count').hasText(this.handler.rowsMeta.total.toString());
      });

      test('it renders the checked mode for the select-all checkbox', async function (assert: Assert) {
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

        assert
          .dom('.hypertable__column.hypertable__column--selection header .upf-checkbox label')
          .doesNotHaveClass('upf-checkbox__fake-checkbox--partial');
        assert.dom('.hypertable__column.hypertable__column--selection header .upf-checkbox input').isChecked();
      });

      test('HyperTableV2::Selection component renders correct value', async function (assert: Assert) {
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

        const countText = document.querySelector('.selection-container .count-container span')?.innerHTML;
        assert.equal(
          this.intlService.t('hypertable.selection.all_records_selected', { count: this.handler.rowsMeta.total }),
          countText
        );
        assert.dom('.selection-container .select-all-container').doesNotExist();
      });
    });

    module('when the select-all checkbox is partially selected', () => {
      test('all checkboxes of loaded rows are selected', async function (assert: Assert) {
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
        assert
          .dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox')
          .exists({ count: 2 });
        findAll('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').forEach(
          (checkbox) => {
            assert.dom(checkbox).isChecked();
          }
        );

        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
        findAll('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').forEach(
          (checkbox) => {
            assert.dom(checkbox).isNotChecked();
          }
        );
      });

      test('all checkboxes of new rows are not selected', async function (assert: Assert) {
        stubFetchMultipleRows(this.handler);
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
        await this.handler.fetchRows();
        await assert.expect(9);

        assert
          .dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox')
          .exists({ count: 4 });

        const checkboxes = document.querySelectorAll(
          '.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input'
        );
        [0, 1].forEach((index) => {
          assert.dom(checkboxes[index]).isChecked();
        });
        [2, 3].forEach((index) => {
          assert.dom(checkboxes[index]).isNotChecked();
        });

        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
        checkboxes.forEach((checkbox) => {
          assert.dom(checkbox).isNotChecked();
        });
      });
    });

    module('when the select-all checkbox is globally selected', () => {
      test('all checkboxes of loaded rows are selected', async function (assert: Assert) {
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
        await this.handler.selectAllGlobal();

        assert
          .dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox')
          .exists({ count: 2 });
        findAll('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').forEach(
          (checkbox) => {
            assert.dom(checkbox).isChecked();
          }
        );

        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
        findAll('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').forEach(
          (checkbox) => {
            assert.dom(checkbox).isNotChecked();
          }
        );
      });

      test('all checkboxes of new rows are also selected', async function (assert: Assert) {
        stubFetchMultipleRows(this.handler);
        await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
        await this.handler.fetchRows();
        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
        await this.handler.selectAllGlobal();
        assert
          .dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox')
          .exists({ count: 4 });
        findAll('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').forEach(
          (checkbox) => {
            assert.dom(checkbox).isChecked();
          }
        );

        await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
        findAll('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').forEach(
          (checkbox) => {
            assert.dom(checkbox).isNotChecked();
          }
        );
      });
    });

    test('clicking a one multiline checkbox toggles its selection status', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

      assert.deepEqual(this.handler.selection, []);

      await click('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox');

      // @ts-ignore
      assert.ok(handlerSpy.updateSelection.calledWithExactly(this.handler.rows[0]));
      assert.equal(this.handler.selection.length, 1);
      assert.ok(this.handler.selection.includes(this.handler.rows[0]));
      assert.dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').isChecked();
      assert.dom('.selected-count').hasText('1');

      await click('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox');

      // @ts-ignore
      assert.ok(handlerSpy.updateSelection.calledWithExactly(this.handler.rows[0]));
      assert.equal(this.handler.selection.length, 0);
      assert
        .dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input')
        .isNotChecked();
      assert.dom('.selected-count').hasText('0');
    });

    test('clicking on all multiline checkbox toggles the global select', async function (assert: Assert) {
      this.rowsFetcher = new AllRowsFetcher();
      this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);
      const handlerSpy = sinon.spy(this.handler);

      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

      assert.deepEqual(this.handler.selection, []);

      await click('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox');
      // @ts-ignore
      assert.ok(handlerSpy.updateSelection.calledWithExactly(this.handler.rows[0]));
      assert.equal(this.handler.selection.length, 1);
      await click('.hypertable__column.hypertable__column--selection .hypertable__cell:last-child .upf-checkbox');
      // @ts-ignore
      assert.ok(handlerSpy.updateSelection.calledWithExactly(this.handler.rows[1]));
      // await this.pauseTest();
      assert.equal(this.handler.selection, 'all');
    });

    test('clicking on one multiline checkbox toggles its exclusion status', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

      await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
      await this.handler.selectAllGlobal();
      assert.deepEqual(this.handler.exclusion, []);

      await click('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox');

      // @ts-ignore
      assert.ok(handlerSpy.updateExclusion.calledWithExactly(this.handler.rows[0]));
      assert.equal(this.handler.exclusion.length, 1);
      assert.ok(this.handler.exclusion.includes(this.handler.rows[0]));
      assert
        .dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input')
        .isNotChecked();
      assert.dom('.selected-count').hasText('11');

      await click('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox');

      // @ts-ignore
      assert.ok(handlerSpy.updateExclusion.calledWithExactly(this.handler.rows[0]));
      assert.equal(this.handler.exclusion.length, 0);
      assert.dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').isChecked();
      assert.dom('.selected-count').hasText('12');
    });
  });

  module('jumping to the last column', function () {
    skip('the button to jump to the last column is displayed if there is overflow', async function (assert: Assert) {
      sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
        return Promise.resolve({
          columns: [
            buildColumn('foo', { filters: [{ key: 'filter1', value: 'toto' }] }),
            buildColumn('foo', { filters: [{ key: 'filter2', value: 'foo' }] }),
            buildColumn('foo', { filters: [{ key: 'filter2', value: 'foo' }] }),
            buildColumn('foo', { filters: [{ key: 'filter2', value: 'foo' }] }),
            buildColumn('foo', { filters: [{ key: 'filter2', value: 'foo' }] })
          ]
        });
      });
      await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

      assert.dom('.scroll-button-container').exists();
      assert.dom('.scroll-button-container').hasClass('is-visible');
    });
  });

  module('FeatureSet: searchable', () => {
    test('if searchable is unset, the search input should be present', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

      assert.dom('div[data-control-name="table_search_input"]').exists();
    });

    test('if searchable is enabled, the search input should be present', async function (assert: Assert) {
      this.features = { searchable: true };
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{this.features}} />`);

      assert.dom('div[data-control-name="table_search_input"]').exists();
    });

    test('if searchable is disabled, the search input should not be present', async function (assert: Assert) {
      this.features = { searchable: false };
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{this.features}} />`);

      assert.dom('div[data-control-name="table_search_input"]').doesNotExist();
    });

    test('if a <:search> named-block is passed to the component, then it should be visible in the table', async function (assert: Assert) {
      await render(hbs`
        <HyperTableV2 @handler={{this.handler}}>
          <:search>
            <div id="example-search-named-block"></div>
          </:search>
        </HyperTableV2>
        `);

      assert.dom('div[data-control-name="table_search_input"]').doesNotExist();
      assert.dom('#example-search-named-block').exists();
    });
  });

  module('Contextual Actions named-block is displayed if defined', () => {
    test('if a <:contextual-actions> named-block is passed to the component, then it should be visible in the table', async function (assert: Assert) {
      await render(hbs`
        <HyperTableV2 @handler={{this.handler}}>
          <:contextual-actions>
            <div id="example-contextual-action-named-block"></div>
          </:contextual-actions>
        </HyperTableV2>
      `);

      assert.dom('#example-contextual-action-named-block').exists();
    });
  });

  function stubFetchMultipleRows(handler: TableHandler): void {
    sinon
      .stub(handler.rowsFetcher, 'fetch')
      .onFirstCall()
      .resolves({
        rows: [
          {
            influencerId: 42,
            recordId: 12,
            record_id: 12,
            holderId: 57,
            holderType: 'list',
            foo: 'ekip',
            bar: 'hello',
            total: 123,
            date: 1643386394
          },
          {
            influencerId: 43,
            recordId: 13,
            record_id: 13,
            holderId: 57,
            holderType: 'list',
            foo: 'second',
            bar: 'second bar',
            total: 123123,
            date: 0
          }
        ],
        meta: { total: 12 }
      })
      .onSecondCall()
      .resolves({
        rows: [
          {
            influencerId: 49,
            recordId: 13,
            record_id: 14,
            holderId: 57,
            holderType: 'list',
            foo: 'third',
            bar: 'third bar',
            total: 65,
            date: 1643396394
          },
          {
            influencerId: 44,
            recordId: 14,
            record_id: 14,
            holderId: 69,
            holderType: 'list',
            foo: 'fourth',
            bar: 'fourth bar',
            total: 1231,
            date: 0
          }
        ],
        meta: { total: 12 }
      });
  }
});
