import { render, type TestContext } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | hyper-table-v2/summary', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.intl = this.owner.lookup('service:intl');
    this.loading = false;
    this.fields = [
      { label: 'Total Orders', value: '1,234' },
      { label: 'ROI', value: '3.2x', tooltip: 'Profit earned for every $1 spent on commissions.' }
    ];
  });

  module('title', () => {
    test('it renders the default title when @title is not provided', async function (this: TestContext, assert) {
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      assert.dom('[data-control-name="hypertable_summary_title"]').hasText(this.intl.t('hypertable.summary.title'));
    });

    test('it renders @title when provided', async function (this: TestContext, assert) {
      await render(
        hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} @title="Conversions summary" />`
      );

      assert.dom('[data-control-name="hypertable_summary_title"]').hasText('Conversions summary');
    });

    test('it does not render a title tooltip icon when @titleTooltip is not provided', async function (this: TestContext, assert) {
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      assert.dom('[data-control-name="hypertable_summary_title_tooltip"]').doesNotExist();
    });

    test('it renders a title tooltip icon displaying @titleTooltip on hover', async function (this: TestContext, assert) {
      await render(
        hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} @titleTooltip="Stats of the filtered records" />`
      );

      assert.dom('[data-control-name="hypertable_summary_title_tooltip"]').hasClass('fa-info-circle');

      await assert
        .tooltip('[data-control-name="hypertable_summary_title_tooltip"]')
        .hasTitle('Stats of the filtered records');
    });
  });

  module('when @loading is true', (hooks) => {
    hooks.beforeEach(function (this: TestContext) {
      this.loading = true;
    });

    test('it renders one skeleton per field', async function (this: TestContext, assert) {
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      assert.dom('[data-control-name="hypertable_summary_skeleton"]').exists({ count: 2 });
      assert.dom('[data-control-name="hypertable_summary_stat"]').doesNotExist();
    });

    test('it renders the default amount of skeletons when @fields is empty', async function (this: TestContext, assert) {
      this.fields = [];
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      assert.dom('[data-control-name="hypertable_summary_skeleton"]').exists({ count: 4 });
    });

    test('it does not render the custom block nor the separator', async function (this: TestContext, assert) {
      await render(hbs`
        <HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}}>
          <:custom><span data-control-name="custom_stat">Community</span></:custom>
        </HyperTableV2::Summary>
      `);

      assert.dom('[data-control-name="custom_stat"]').doesNotExist();
      assert.dom('[data-control-name="hypertable_summary_separator"]').doesNotExist();
    });
  });

  module('when @loading is false', () => {
    test('it renders one stat per field', async function (this: TestContext, assert) {
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      assert.dom('[data-control-name="hypertable_summary_skeleton"]').doesNotExist();
      assert.dom('[data-control-name="hypertable_summary_stat"]').exists({ count: 2 });
      assert
        .dom(
          '[data-control-name="hypertable_summary_stat"]:nth-child(1) [data-control-name="hypertable_summary_stat_label"]'
        )
        .hasText('Total Orders');
      assert
        .dom(
          '[data-control-name="hypertable_summary_stat"]:nth-child(1) [data-control-name="hypertable_summary_stat_value"]'
        )
        .hasText('1,234');
      assert
        .dom(
          '[data-control-name="hypertable_summary_stat"]:nth-child(2) [data-control-name="hypertable_summary_stat_label"]'
        )
        .hasText('ROI');
      assert
        .dom(
          '[data-control-name="hypertable_summary_stat"]:nth-child(2) [data-control-name="hypertable_summary_stat_value"]'
        )
        .hasText('3.2x');
    });

    test('it does not render a tooltip icon when the field has no tooltip', async function (this: TestContext, assert) {
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      assert
        .dom(
          '[data-control-name="hypertable_summary_stat"]:nth-child(1) [data-control-name="hypertable_summary_stat_tooltip"]'
        )
        .doesNotExist();
    });

    test('it renders a tooltip icon displaying the field tooltip on hover', async function (this: TestContext, assert) {
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      const tooltipSelector =
        '[data-control-name="hypertable_summary_stat"]:nth-child(2) [data-control-name="hypertable_summary_stat_tooltip"]';
      assert.dom(tooltipSelector).hasClass('fa-info-circle');

      await assert.tooltip(tooltipSelector).hasTitle('Profit earned for every $1 spent on commissions.');
    });

    test('it renders no stat when @fields is empty', async function (this: TestContext, assert) {
      this.fields = [];
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      assert.dom('[data-control-name="hypertable_summary_stat"]').doesNotExist();
      assert.dom('[data-control-name="hypertable_summary_skeleton"]').doesNotExist();
    });

    test('it does not render the separator when the custom block is not provided', async function (this: TestContext, assert) {
      await render(hbs`<HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}} />`);

      assert.dom('[data-control-name="hypertable_summary_separator"]').doesNotExist();
    });

    test('it renders the custom block followed by a separator before the fields', async function (this: TestContext, assert) {
      await render(hbs`
        <HyperTableV2::Summary @loading={{this.loading}} @fields={{this.fields}}>
          <:custom><span data-control-name="custom_stat">Community</span></:custom>
        </HyperTableV2::Summary>
      `);

      assert.dom('.hypertable-summary-v2__fields > :nth-child(1)').hasAttribute('data-control-name', 'custom_stat');
      assert.dom('[data-control-name="custom_stat"]').hasText('Community');
      assert
        .dom('.hypertable-summary-v2__fields > :nth-child(2)')
        .hasAttribute('data-control-name', 'hypertable_summary_separator');
      assert
        .dom('.hypertable-summary-v2__fields > :nth-child(3)')
        .hasAttribute('data-control-name', 'hypertable_summary_stat');
    });
  });
});
