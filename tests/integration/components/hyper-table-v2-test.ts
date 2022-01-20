import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click,  findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Row } from '@upfluence/hypertable/core/interfaces';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

module('Integration | Component | hyper-table-v2', function (hooks) {
  setupRenderingTest(hooks);
  hooks.beforeEach(function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);
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
    assert.dom('.hypertable__column').exists({ count: 2 });

    assert.dom('.hypertable__sticky-columns .hypertable__column').exists({ count: 1 });
    assert.dom('.hypertable__sticky-columns .hypertable__column header').hasText('Name: foo');
    assert.dom('.hypertable__column:nth-child(2) header').hasText('Name: bar');
  });

  test('it sets up the rows correctly', async function (assert: Assert) {
    await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

    assert.dom('.hypertable__cell').exists({ count: 4 });
    assert.dom('.hypertable__sticky-columns .hypertable__column .hypertable__cell').exists({ count: 2 });
    assert.dom('.hypertable__column:nth-child(2) .hypertable__cell').exists({ count: 2 });
  });

  test('it triggers the onRowClick action correctly', async function (assert: Assert) {
    this.onRowClick = (row: Row) => {
      assert.equal(row, this.handler.rows[0]);
    };

    await render(hbs`<HyperTableV2 @handler={{this.handler}} @onRowClick={{this.onRowClick}} />`);
    await click('.hypertable__sticky-columns > .hypertable__column .hypertable__cell');

    assert.expect(1);
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

  module('selection', function () {
    test('the selection checkboxes are not present if the feature is not enabled', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=false}} />`);

      assert.dom('.hypertable__column.hypertable__column--selection').doesNotExist();
    });

    test('the selection column is present when the feature is enabled', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

      assert.dom('.hypertable__column.hypertable__column--selection').exists();
      assert.dom('.upf-checkbox').exists({ count: 3 });
    });

    test('clicking the checkbox in the header of the selection column triggers the SelectAll', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

      assert.deepEqual(this.handler.selection, []);
      assert.dom('.hypertable__column.hypertable__column--selection header .upf-checkbox').exists();

      await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
      // @ts-ignore
      assert.ok(handlerSpy.toggleSelectAll.calledOnceWithExactly(true));
      assert.equal(this.handler.selection, 'all');
    });

    test("when in SelectAll mode, all rows' selection checkboxes are disabled", async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);
      await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');

      assert
        .dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox')
        .exists({ count: 2 });
      findAll('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').forEach(
        (checkbox) => {
          assert.dom(checkbox).hasAttribute('disabled');
        }
      );

      await click('.hypertable__column.hypertable__column--selection header .upf-checkbox');
      findAll('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').forEach(
        (checkbox) => {
          assert.dom(checkbox).hasNoAttribute('disabled');
        }
      );
    });

    test('clicking a row selection checkbox toggles its selection status', async function (assert: Assert) {
      const handlerSpy = sinon.spy(this.handler);
      await render(hbs`<HyperTableV2 @handler={{this.handler}} @features={{hash selection=true}} />`);

      assert.deepEqual(this.handler.selection, []);

      await click('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox');

      // @ts-ignore
      assert.ok(handlerSpy.updateSelection.calledWithExactly(this.handler.rows[0]));
      assert.equal(this.handler.selection.length, 1);
      assert.ok(this.handler.selection.includes(this.handler.rows[0]));
      assert.dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input').isChecked();

      await click('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox');

      // @ts-ignore
      assert.ok(handlerSpy.updateSelection.calledWithExactly(this.handler.rows[0]));
      assert.equal(this.handler.selection.length, 0);
      assert
        .dom('.hypertable__column.hypertable__column--selection .hypertable__cell .upf-checkbox input')
        .isNotChecked();
    });
  });

  module('jumping to the last column', function () {
    test('the button to jump to the last column is displayed if there is overflow', async function (assert: Assert) {
      await render(hbs`<HyperTableV2 @handler={{this.handler}} />`);

      assert.dom('.scroll-button-container').exists();
      assert.dom('.scroll-button-container').hasClass('is-visible');
    });
  });
});
