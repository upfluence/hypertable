import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { getContext, setContext } from '@ember/test-helpers';
import { ensureSafeComponent } from '@embroider/util';

import BaseRenderingResolver from '@upfluence/hypertable/core/rendering-resolver';
import { buildColumnDefinition } from '@upfluence/hypertable/test-support/table-manager';
import BaseHeaderRenderer from '@upfluence/hypertable/components/hyper-table-v2/header-renderers/base';

module('Unit | core/rendering-resolver', function (hooks) {
  setupApplicationTest(hooks);
  setContext(hooks);

  test('it works', function (assert) {
    const renderingResolver = new BaseRenderingResolver(this);
    assert.ok(renderingResolver);
  });

  test('it returns the right header rendering component', async function (assert: Assert) {
    const renderingResolver = new BaseRenderingResolver(getContext());
    const resolved = await renderingResolver.lookupHeaderComponent(buildColumnDefinition('foo'));
    assert.deepEqual(resolved.component, ensureSafeComponent(BaseHeaderRenderer, getContext()))
    assert.equal(resolved.args, undefined)
  });
});
