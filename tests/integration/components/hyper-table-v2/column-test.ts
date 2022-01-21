import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import { buildColumn } from '@upfluence/hypertable/test-support/table-manager';
import { FieldSize } from '@upfluence/hypertable/core/interfaces';

module('Integration | Component | hyper-table-v2/column', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
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

  test('it has the right size class', async function (assert: Assert) {
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

  test('it looks up the rendering component for the column header', async function (assert: Assert) {
    const renderingResolverSpy = sinon.spy(this.handler.renderingResolver);

    await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);

    // @ts-ignore
    assert.ok(renderingResolverSpy.lookupHeaderComponent.calledOnceWithExactly(this.column.definition));
  });

  test('it skips looking up the filtering renderer if the column is not filterable nor orderable', async function (assert: Assert) {
    const renderingResolverSpy = sinon.spy(this.handler.renderingResolver);

    await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);

    // @ts-ignore
    assert.ok(renderingResolverSpy.lookupFilteringComponent.neverCalledWith(this.column.definition));
  });

  test('it looks up the rendering component for the filtering if the column is filterable or orderable', async function (assert: Assert) {
    const renderingResolverSpy = sinon.spy(this.handler.renderingResolver);
    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: [buildColumn('foo', { size: FieldSize.Large, filterable: true })]
      });
    });
    await this.handler.fetchColumns();
    this.column = this.handler.columns[0];

    await render(hbs`<HyperTableV2::Column @handler={{this.handler}} @column={{this.column}} />`);

    // @ts-ignore
    assert.ok(renderingResolverSpy.lookupFilteringComponent.calledOnceWithExactly(this.column.definition));
  });
});
