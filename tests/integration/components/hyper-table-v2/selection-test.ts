import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | hyper-table-v2/selection', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.selected = 1;
    this.total = 5;
    this.onClear = sinon.stub();
    this.onSelectAll = sinon.stub();

    this.intlService = this.owner.lookup('service:intl');
  });

  test("it doesn't renders when @selected is equal to 0", async function (assert) {
    this.selected = 0;
    await render(hbs`
      <div class="hypertable-container">
        <HyperTableV2::Selection @selected={{this.selected}} @total={{this.total}} @onClear={{this.onClear}}
                                 @onSelectAll={{this.onSelectAll}} />
      </div>
    `);
    assert.dom('.selection-container').exists();
    assert.dom('.selection-container').hasStyle({
      visibility: 'hidden'
    });
  });

  test('it renders when @selected is superior to 0', async function (assert) {
    await render(hbs`
      <div class="hypertable-container">
        <HyperTableV2::Selection @selected={{this.selected}} @total={{this.total}} @onClear={{this.onClear}}
                                 @onSelectAll={{this.onSelectAll}} />
      </div>
    `);
    assert.dom('.selection-container').exists();
    assert.dom('.selection-container').hasStyle({
      visibility: 'visible'
    });
  });

  module('for creator number render', () => {
    test('if @selected is inferior to @total, it renders the right wording', async function (assert) {
      await render(hbs`
        <HyperTableV2::Selection @selected={{this.selected}} @total={{this.total}} @onClear={{this.onClear}}
                                 @onSelectAll={{this.onSelectAll}} />
      `);
      assert
        .dom('.count-container span')
        .hasText(this.intlService.t('hypertable.selection.creator_selected', { count: 1 }));
    });

    test('if @selected is equal to @total, it renders the right wording', async function (assert) {
      this.selected = 5;
      await render(hbs`
        <HyperTableV2::Selection @selected={{this.selected}} @total={{this.total}} @onClear={{this.onClear}}
                                 @onSelectAll={{this.onSelectAll}} />
      `);
      assert.equal(
        document.querySelector('.count-container span')?.innerHTML,
        this.intlService.t('hypertable.selection.all_creators_selected', { count: 5 })
      );
    });
  });

  module('for select all button', () => {
    test('if @selected is inferior to @total, it renders the right wording', async function (assert) {
      await render(hbs`
        <HyperTableV2::Selection @selected={{this.selected}} @total={{this.total}} @onClear={{this.onClear}}
                                 @onSelectAll={{this.onSelectAll}} />
      `);
      assert.dom('.select-all-container').hasText(this.intlService.t('hypertable.selection.select_all', { count: 5 }));
    });

    test("if @selected is equal to @total, it doesn't render it", async function (assert) {
      this.selected = 5;
      await render(hbs`
        <HyperTableV2::Selection @selected={{this.selected}} @total={{this.total}} @onClear={{this.onClear}}
                                 @onSelectAll={{this.onSelectAll}} />
      `);
      assert.dom('.select-all-container').doesNotExist();
    });

    test('when clicking on it, it calls the @onSelectAll', async function (assert) {
      await render(hbs`
        <HyperTableV2::Selection @selected={{this.selected}} @total={{this.total}} @onClear={{this.onClear}}
                                 @onSelectAll={{this.onSelectAll}} />
      `);

      await click('.select-all-container');
      assert.true(this.onSelectAll.calledOnceWithExactly());
    });
  });

  test('when clicking on clear button, it calls the @onClear', async function (assert) {
    await render(hbs`
      <HyperTableV2::Selection @selected={{this.selected}} @total={{this.total}} @onClear={{this.onClear}}
                               @onSelectAll={{this.onSelectAll}} />
    `);

    await click('.clear-container');
    assert.true(this.onClear.calledOnceWithExactly());
  });
});
