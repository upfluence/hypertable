import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { render, type TestContext } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | hyper-table/cell-renderers/numeric', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a value', async function (this: TestContext, assert) {
    this.item = EmberObject.create({ total: 123 });
    this.column = EmberObject.create({ key: 'total', field: EmberObject.create({}), upsertable: false });
    this.manager = EmberObject.create({ editStatus: A([]) });

    await render(
      hbs`<HyperTable::CellRenderers::Numeric
        @item={{this.item}}
        @column={{this.column}}
        @manager={{this.manager}}
      />`
    );

    assert.dom('.text-value').hasText('123');
  });

  test('it renders a default when the value is empty', async function (this: TestContext, assert) {
    this.item = EmberObject.create({ total: null });
    this.column = EmberObject.create({ key: 'total', field: EmberObject.create({}), upsertable: false });
    this.manager = EmberObject.create({ editStatus: A([]) });

    await render(
      hbs`<HyperTable::CellRenderers::Numeric
        @item={{this.item}}
        @column={{this.column}}
        @manager={{this.manager}}
      />`
    );

    assert.dom().hasText('—');
  });
});
