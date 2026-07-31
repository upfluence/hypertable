import { render, type TestContext } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | normalize-category-name', function (hooks) {
  setupRenderingTest(hooks);

  test('when the category has no spaces, it lowercases the value', async function (this: TestContext, assert) {
    this.category = 'Sports';

    await render(hbs`<span>{{normalize-category-name this.category}}</span>`);

    assert.dom('span').hasText('sports');
  });

  test('when the category has spaces, it replaces them with underscores and lowercases', async function (this: TestContext, assert) {
    this.category = 'Social Media';

    await render(hbs`<span>{{normalize-category-name this.category}}</span>`);

    assert.dom('span').hasText('social_media');
  });

  test('when the category has multiple consecutive spaces, it collapses them into a single underscore', async function (this: TestContext, assert) {
    this.category = 'Health  &  Wellness';

    await render(hbs`<span>{{normalize-category-name this.category}}</span>`);

    assert.dom('span').hasText('health_&_wellness');
  });

  test('when the category is already lowercase with underscores, it returns it unchanged', async function (this: TestContext, assert) {
    this.category = 'already_normalized';

    await render(hbs`<span>{{normalize-category-name this.category}}</span>`);

    assert.dom('span').hasText('already_normalized');
  });
});
