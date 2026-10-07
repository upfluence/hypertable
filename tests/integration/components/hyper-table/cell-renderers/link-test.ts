import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { render, type TestContext } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | hyper-table/cell-renderers/link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a link value', async function (this: TestContext, assert) {
    this.item = EmberObject.create({ website: 'https://example.com' });
    this.column = EmberObject.create({ key: 'website', field: EmberObject.create({}) });
    this.manager = EmberObject.create({ editStatus: A([]) });

    await render(
      hbs`<HyperTable::CellRenderers::Link
        @item={{this.item}}
        @column={{this.column}}
        @manager={{this.manager}}
      />`
    );

    assert.dom('a.link__value').hasAttribute('href', 'https://example.com');
    assert.dom('a.link__value').hasText('https://example.com');
  });

  test('it renders a default when the value is empty', async function (this: TestContext, assert) {
    this.item = EmberObject.create({ website: null });
    this.column = EmberObject.create({ key: 'website', field: EmberObject.create({}) });
    this.manager = EmberObject.create({ editStatus: A([]) });

    await render(
      hbs`<HyperTable::CellRenderers::Link
        @item={{this.item}}
        @column={{this.column}}
        @manager={{this.manager}}
      />`
    );

    assert.dom().hasText('—');
  });
});
