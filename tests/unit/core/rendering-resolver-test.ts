import { getContext, setContext, type TestContext } from '@ember/test-helpers';
import { ensureSafeComponent } from '@embroider/util';

import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import AmountCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/amount';
import NumericFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/numeric';
import BaseHeaderRenderer from '@upfluence/hypertable/components/hyper-table-v2/header-renderers/base';
import BaseRenderingResolver from '@upfluence/hypertable/core/rendering-resolver';
import { buildColumnDefinition } from '@upfluence/hypertable/test-support/table-manager';

module('Unit | core/rendering-resolver', function (hooks) {
  setupApplicationTest(hooks);
  setContext(hooks);

  test('it works', function (this: TestContext, assert) {
    const renderingResolver = new BaseRenderingResolver(this);
    assert.ok(renderingResolver);
  });

  test('it returns the right header rendering component', async function (assert: Assert) {
    const renderingResolver = new BaseRenderingResolver(getContext());
    const resolved = await renderingResolver.lookupHeaderComponent(buildColumnDefinition('foo'));
    assert.deepEqual(resolved.component, ensureSafeComponent(BaseHeaderRenderer, getContext()));
    assert.strictEqual(resolved.args, undefined);
  });

  test('it returns the amount cell rendering component for a money column', async function (assert: Assert) {
    const renderingResolver = new BaseRenderingResolver(getContext());
    const resolved = await renderingResolver.lookupCellComponent(buildColumnDefinition('amount', { type: 'money' }));
    assert.deepEqual(resolved.component, ensureSafeComponent(AmountCellRenderer, getContext()));
  });

  test('it returns the numeric filtering component for a money column', async function (assert: Assert) {
    const renderingResolver = new BaseRenderingResolver(getContext());
    const resolved = await renderingResolver.lookupFilteringComponent(
      buildColumnDefinition('amount', { type: 'money' })
    );
    assert.deepEqual(resolved.component, ensureSafeComponent(NumericFilteringRenderer, getContext()));
  });

  test('it returns the base header rendering component for a money column', async function (assert: Assert) {
    const renderingResolver = new BaseRenderingResolver(getContext());
    const resolved = await renderingResolver.lookupHeaderComponent(buildColumnDefinition('amount', { type: 'money' }));
    assert.deepEqual(resolved.component, ensureSafeComponent(BaseHeaderRenderer, getContext()));
  });
});
