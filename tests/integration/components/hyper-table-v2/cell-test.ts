import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import sinon from 'sinon';

module('Integration | Component | hyper-table-v2/cell', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    await this.handler.fetchColumns();
    await this.handler.fetchRows();

    this.column = this.handler.columns[0];
    this.row = this.handler.rows[0];
  });

  test('it renders the loading state correctly', async function (assert) {
    await render(hbs`<HyperTableV2::Cell @loading={{true}} />`);
    assert.dom('.hypertable__cell').hasClass('hypertable__cell--loading');
    assert.dom('.hypertable__cell .skeleton-placeholder').exists();
  });

  test('it looks up the rendering component for the column', async function (assert: Assert) {
    const renderingResolverSpy = sinon.spy(this.handler.renderingResolver);

    await render(hbs`<HyperTableV2::Cell @handler={{this.handler}} @column={{this.column}} @row={{this.row}} />`);

    // @ts-ignore
    assert.ok(renderingResolverSpy.lookupCellComponent.calledOnceWithExactly(this.column.definition));
    assert.dom('.hypertable__cell').hasText('ekip');
  });
});
