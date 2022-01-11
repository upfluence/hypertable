import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';

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

  // test it displays the loading state

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

    assert.dom('.hypertable__column div.yielded').hasText('foobar')
    assert.dom('.hypertable__column div.yielded').hasText('foobar');
  });
});
