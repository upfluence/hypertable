import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | array-includes', function (hooks) {
  setupRenderingTest(hooks);

  test('it returns the right value depending on the presence', async function (assert) {
    this.arr = [1, 2, 3];
    this.checkedElement = 1;

    await render(hbs`<div class={{if (array-includes this.arr this.checkedElement) 'foo' 'bar'}}>hello</div>`);

    assert.dom('div').hasClass('foo');
    this.set('checkedElement', 5);
    assert.dom('div').hasClass('bar');
  });
});
