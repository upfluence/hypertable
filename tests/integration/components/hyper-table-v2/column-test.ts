import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { setupIntl, type TestContext } from 'ember-intl/test-support';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';

module('Integration | Component | hyper-table-v2/column', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();

    this.column = this.handler.columns[0];
  });

  test('it renders', async function (assert) {
    await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);

    assert.dom('.hypertable__column').exists();
  });

  test('it has the right size class', async function (this: TestContext, assert: Assert) {
    await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);

    assert.equal(this.column.definition.size, 'M');
    assert.dom('.hypertable__column').hasClass('hypertable__column--size-M');

    this.set('column', this.handler.columns[1]);

    assert.equal(this.column.definition.size, 'L');
    assert.dom('.hypertable__column').hasClass('hypertable__column--size-L');
  });

  test('it yields correctly to the parent template', async function (assert: Assert) {
    await render(hbs`
      <HyperTableV2::Column @handler={{this.handler}} @column={{this.column}}>
        <div class="yielded">foobar</div>
      </HyperTableV2::Column>
    `);

    assert.dom('.hypertable__column div.yielded').hasText('foobar');
  });

  test('it renders the loading state', async function (this: TestContext, assert: Assert) {
    sinon.stub(this.handler.renderingResolver, 'lookupHeaderComponent').resolves(new Promise(() => {}));
    await render(hbs`
      <HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />
    `);

    assert.dom('.hypertable__column .far.fa-spinner.fa-spin').exists();
  });

  module('For the rendering components', (hooks) => {
    hooks.beforeEach(async function (this: TestContext) {
      this.renderingResolverSpy = sinon.spy(this.handler.renderingResolver);
    });

    test('it looks up it for the column header', async function (this: TestContext, assert: Assert) {
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.ok(this.renderingResolverSpy.lookupHeaderComponent.calledOnceWithExactly(this.column.definition));
    });

    test('it skips looking up the filtering renderer if the column is not filterable nor orderable', async function (this: TestContext, assert: Assert) {
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.ok(this.renderingResolverSpy.lookupFilteringComponent.neverCalledWith(this.column.definition));
    });

    test('it looks up it for the filtering if the column is filterable or orderable', async function (this: TestContext, assert: Assert) {
      sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
        return Promise.resolve({
          columns: [buildColumn('foo', { size: FieldSize.Large, filterable: true })]
        });
      });
      await this.handler.fetchColumns();
      this.column = this.handler.columns[0];

      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);

      assert.ok(this.renderingResolverSpy.lookupFilteringComponent.calledOnceWithExactly(this.column.definition));
    });
  });

  module('For orderable indicator', (hooks) => {
    hooks.beforeEach(function (this: TestContext) {
      this.column.definition.orderable = true;
      this.column.order = { direction: undefined };
    });

    test("when the column isn't orderable, it doesn't render the double arrow icon", async function (this: TestContext, assert: Assert) {
      this.column.definition.orderable = false;
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('.order-command').doesNotExist();
      assert.dom('.far.fa-long-arrow-up').doesNotExist();
      assert.dom('.far.fa-long-arrow-down').doesNotExist();
    });

    test('when column is orderable, it renders the double arrow icon', async function (this: TestContext, assert: Assert) {
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('.order-command').exists();
      assert.dom('.far.fa-long-arrow-up').doesNotExist();
      assert.dom('.far.fa-long-arrow-down').doesNotExist();
    });

    test('it renders the correct tooltip for the double arrow icon', async function (this: TestContext, assert: Assert) {
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      // @ts-ignore
      await assert.tooltip('.order-command').hasTitle('Order');
    });

    test('it renders the asc arrow up icon', async function (this: TestContext, assert: Assert) {
      this.column.order.direction = 'asc';
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('.order-command').doesNotExist();
      assert.dom('.far.fa-long-arrow-up').exists();
      assert.dom('.far.fa-long-arrow-down').doesNotExist();
    });

    test('it renders the desc arrow down icon', async function (this: TestContext, assert: Assert) {
      this.column.order.direction = 'desc';
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('.order-command').doesNotExist();
      assert.dom('.far.fa-long-arrow-up').doesNotExist();
      assert.dom('.far.fa-long-arrow-down').exists();
    });
  });

  module('for filtering button', (hooks) => {
    hooks.beforeEach(function (this: TestContext) {
      this.column.definition.filterable = true;
      this.column.definition.orderable = true;
    });

    test('it renders it', async function (this: TestContext, assert: Assert) {
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('.filter-command').exists();
      assert.dom('.filter-command').doesNotHaveClass('filter-command--opened');
    });

    test('it renders the correct tooltip', async function (this: TestContext, assert: Assert) {
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      // @ts-ignore
      await assert.tooltip('.filter-command').hasTitle('Filters');
    });

    test('when column is not orderable, it renders', async function (this: TestContext, assert: Assert) {
      this.column.definition.orderable = false;
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('.filter-command').exists();
    });

    test('when column is not filterable, it renders', async function (this: TestContext, assert: Assert) {
      this.column.definition.filterable = false;
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('.filter-command').exists();
    });

    test("when column is not filterable & not orderable, it doesn't render it", async function (this: TestContext, assert: Assert) {
      this.column.definition.filterable = false;
      this.column.definition.orderable = false;
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      assert.dom('.filter-command').doesNotExist();
    });

    test('when clicking on it, it renders the correct class', async function (this: TestContext, assert: Assert) {
      await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);
      await click('.filter-command');
      assert.dom('.filter-command').hasClass('filter-command--opened');
    });
  });

  test('the icon commands are not displayed if the @delegatedFiltering arg is truthy', async function (assert) {
    await render(hbs`
      <HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} @delegatedFiltering={{true}} />
    `);

    assert.dom('.hypertable__column .icon-commands').doesNotExist();
  });
});
