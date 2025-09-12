import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | hyper-table/cell-renderers/image', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.item = { imageURL: 'foo.png', name: 'FooBar' };
    this.column = { key: 'imageURL', labels: ['name'] };

    await render(hbs`<HyperTable::CellRenderers::Image @item={{this.item}} @column={{this.column}} />`);

    assert.dom('.upf-avatar.upf-avatar--sm img').hasAttribute('src', 'foo.png');
  });

  module('it has labels to show', function () {
    test('it should display the labels next to the image', async function (assert) {
      this.item = { imageURL: 'foo.png', name: 'FooBar' };
      this.column = { key: 'imageURL', labels: ['name'] };

      await render(hbs`<HyperTable::CellRenderers::Image @item={{this.item}} @column={{this.column}} />`);

      assert.dom('.upf-avatar.upf-avatar--sm img').exists();

      assert.dom('span.margin-left-xx-sm.text-ellipsis-160').hasText('FooBar');
    });
  });

  module('there is a notification on the item', function () {
    test('it should display the notification dot next to the labels', async function (assert) {
      this.item = { imageURL: 'foo.png', name: 'FooBar', hasNotifications: true };
      this.column = { key: 'imageURL', labels: ['name'] };

      await render(hbs`<HyperTable::CellRenderers::Image @item={{this.item}} @column={{this.column}} />`);

      assert.dom('.upf-avatar.upf-avatar--sm img').exists();

      assert.dom('span.margin-left-xx-sm.text-ellipsis-160').hasText('FooBar');
      assert.dom('span.upf-notification--inline').exists();
    });
  });
});
