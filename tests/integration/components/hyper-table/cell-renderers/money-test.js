import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | hyper-table/cell-renderers/money', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{hyper-table/cell-renderers/money}}`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#hyper-table/cell-renderers/money}}
        template block text
      {{/hyper-table/cell-renderers/money}}
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
