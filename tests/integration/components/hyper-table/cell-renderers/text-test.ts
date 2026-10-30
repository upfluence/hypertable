import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { render, type TestContext } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | hyper-table/cell-renderers/text', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a value', async function (this: TestContext, assert) {
    this.item = EmberObject.create({ name: 'FooBar' } as object);
    this.column = EmberObject.create({ key: 'name', field: EmberObject.create({}), upsertable: false } as object);
    this.manager = EmberObject.create({ editStatus: A([]) } as object);

    await render(
      hbs`<HyperTable::CellRenderers::Text
        @item={{this.item}}
        @column={{this.column}}
        @manager={{this.manager}}
      />`
    );

    assert.dom('.text-value').hasText('FooBar');
  });

  test('it renders a default when the value is empty', async function (this: TestContext, assert) {
    this.item = EmberObject.create({ name: null } as object);
    this.column = EmberObject.create({ key: 'name', field: EmberObject.create({}), upsertable: false } as object);
    this.manager = EmberObject.create({ editStatus: A([]) } as object);

    await render(
      hbs`<HyperTable::CellRenderers::Text
        @item={{this.item}}
        @column={{this.column}}
        @manager={{this.manager}}
      />`
    );

    assert.dom().hasText('—');
  });
});
