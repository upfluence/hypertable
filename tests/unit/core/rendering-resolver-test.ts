import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { getContext } from '@ember/test-helpers';

import BaseRenderingResolver from '@upfluence/hypertable/core/rendering-resolver';
import { buildColumnDefinition } from '@upfluence/hypertable/test-support/table-manager';
import BaseHeaderRenderer from '@upfluence/hypertable/components/hyper-table-v2/header-renderers/base';

module('Unit | core/rendering-resolver', function (hooks) {
  setupApplicationTest(hooks);

  test('it works', function (assert) {
    const renderingResolver = new BaseRenderingResolver(this);
    assert.ok(renderingResolver);
  });

  test('it returns the right header rendering component', async function (assert: Assert) {
    const renderingResolver = new BaseRenderingResolver(getContext());
    const resolved = await renderingResolver.lookupHeaderComponent(buildColumnDefinition('foo'));
    // @ts-ignore
    assert.ok(resolved.component.inner.ComponentClass.class === BaseHeaderRenderer);
    assert.equal(resolved.args, undefined)
  });
});
