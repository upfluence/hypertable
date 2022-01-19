import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { RowsFetcher, TableManager } from '@upfluence/hypertable/test-support';
import TableHandler from '@upfluence/hypertable/core/handler';
import sinon from 'sinon';
import { buildColumn, buildColumnDefinition } from '@upfluence/hypertable/test-support/table-manager';
import { Column, ColumnDefinition } from '@upfluence/hypertable/core/interfaces';

const COLUMN_DEFINITIONS = [
  { key: 'alone', extra: { category: '', clustering_key: '' } },
  { key: 'code', extra: { category: 'affiliation', clustering_key: '' } },
  { key: 'foo', extra: { category: 'influencer', clustering_key: 'instagram' } },
  { key: 'bar', extra: { category: 'influencer', clustering_key: 'youtube' } }
];

const COLUMNS = [{ key: 'code', extra: { category: 'affiliation', clustering_key: '' } }];

module('Integration | Component | hyper-table-v2/manage-columns', function (hooks) {
  setupRenderingTest(hooks);

  function builderHelper(
    columnOptions: Array<{ key: string; extra: { [key: string]: string } }>,
    buildMethod: (key: string, extra: { [key: string]: string }) => ColumnDefinition | Column
  ): (ColumnDefinition | Column)[] {
    return columnOptions.reduce((columns, column) => [...columns, ...[buildMethod(column.key, column.extra)]], []);
  }

  hooks.beforeEach(async function () {
    this.tableManager = new TableManager();
    this.rowsFetcher = new RowsFetcher();
    this.handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

    sinon.stub(this.tableManager, 'fetchColumnDefinitions').callsFake(() => {
      return Promise.resolve({
        column_definitions: builderHelper(COLUMN_DEFINITIONS, buildColumnDefinition)
      });
    });

    sinon.stub(this.tableManager, 'fetchColumns').callsFake(() => {
      return Promise.resolve({
        columns: builderHelper(COLUMNS, buildColumn)
      });
    });

    await this.handler.fetchColumnDefinitions();
    await this.handler.fetchColumns();
  });

  test('it renders', async function (assert) {
    await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
    assert.dom('.available-fields-wrapper.invisible').exists({ count: 1 });
  });

  module('when a user click on manage column button', function () {
    test('it should open the available columns', async function (assert) {
      await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
      await click('.upf-btn.upf-btn--primary');

      assert.dom('.available-fields-wrapper.visible').exists({ count: 1 });
    });

    module('when user manages categories', function () {
      test('it displays all categories', async function (assert) {
        await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
        await click('.upf-btn.upf-btn--primary');

        assert.dom('.available-fields-wrapper__categories').exists({ count: 1 });
        assert.dom('[data-control-name="field_category_toggle_all_fields"]').exists({ count: 1 });
        assert.dom('[data-control-name="field_category_toggle_affiliation"]').exists({ count: 1 });
        assert.dom('[data-control-name="field_category_toggle_influencer"]').exists({ count: 1 });
      });

      test('it displays the default category as active', async function (assert) {
        await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
        await click('.upf-btn.upf-btn--primary');

        assert.dom('[data-control-name="field_category_toggle_all_fields"]').hasClass('field-category--active');
      });

      test('it displays all the column definitions for default category', async function (assert) {
        await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
        await click('.upf-btn.upf-btn--primary');

        document.querySelectorAll('.fields-list .field').forEach((element, index) => {
          assert.equal(
            element.firstElementChild?.getAttribute('data-control-name'),
            `column_definition_toggle_checkbox_${COLUMN_DEFINITIONS[index].key}`
          );
        });

        const clusterNames = document.querySelectorAll('.fields-list .cluster-name');

        assert.equal(clusterNames[0].textContent?.trim(), 'instagram');
        assert.equal(clusterNames[1].textContent?.trim(), 'youtube');
        assert.expect(6);
      });

      test('it sets the category. as active when user select a category', async function (assert) {
        await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
        await click('.upf-btn.upf-btn--primary');
        await click('[data-control-name="field_category_toggle_affiliation"]');

        assert.dom('[data-control-name="field_category_toggle_affiliation"]').hasClass('field-category--active');
        assert.dom('[data-control-name="field_category_toggle_all_fields"]').doesNotHaveClass('field-category--active');
      });

      test('it displays the column definitions of active category with clustering key', async function (assert) {
        await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
        await click('.upf-btn.upf-btn--primary');
        await click('[data-control-name="field_category_toggle_influencer"]');

        const columnDefinitionsVisible = document.querySelector('.fields-list')?.children || [];

        assert.equal(columnDefinitionsVisible[0].textContent?.trim(), 'instagram');
        assert.equal(
          columnDefinitionsVisible[1].firstElementChild?.getAttribute('data-control-name'),
          'column_definition_toggle_checkbox_foo'
        );
        assert.equal(columnDefinitionsVisible[2].textContent?.trim(), 'youtube');
        assert.equal(
          columnDefinitionsVisible[3].firstElementChild?.getAttribute('data-control-name'),
          'column_definition_toggle_checkbox_bar'
        );
      });

      test('it display column definitions of active category without clustering key', async function (assert) {
        await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
        await click('.upf-btn.upf-btn--primary');
        await click('[data-control-name="field_category_toggle_affiliation"]');

        const columnDefinitionsVisible = document.querySelector('.fields-list')?.children || [];

        assert.equal(
          columnDefinitionsVisible[0].firstElementChild?.getAttribute('data-control-name'),
          'column_definition_toggle_checkbox_code'
        );
      });
    });

    module('when user manages column definition', function () {
      test('it displays the column in the table', async function (assert) {
        await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
        await click('.upf-btn.upf-btn--primary');

        const columnDefinitionsChecked = document.querySelectorAll('.fields-list .field input:checked');
        assert.ok(columnDefinitionsChecked.length === 1);
        assert.equal(
          columnDefinitionsChecked[0].parentElement?.getAttribute('data-control-name'),
          'column_definition_toggle_checkbox_code'
        );
      });

      test('it searches in column definitions', async function (assert) {
        await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
        await click('.upf-btn.upf-btn--primary');
        await fillIn('.search input', 'alone');

        assert.dom('.field').exists({ count: 1 });
        assert.dom('[data-control-name="column_definition_toggle_checkbox_alone"]').exists({ count: 1 });
      });
    });

    test('it removes the column in the table', async function (assert) {
      let upsertColumnsMock = sinon.stub(this.tableManager, 'upsertColumns').callsFake(({ columns }) => {
        assert.deepEqual(columns, []);
        return Promise.resolve({ columns: [] });
      });

      await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);
      await click('.upf-btn.upf-btn--primary');
      await click('[data-control-name="column_definition_toggle_checkbox_code"] input');

      assert.ok(upsertColumnsMock.calledOnce);
    });

    test('it adds the column in the table', async function (assert) {
      const upsertColumnsMock = sinon.stub(this.tableManager, 'upsertColumns').callsFake(({ columns }) => {
        const updatedColumns = [
          {
            definition: {
              key: 'code',
              type: 'text',
              name: 'Name: code',
              clustering_key: '',
              category: 'affiliation',
              size: 'M',
              orderable: false,
              filterable: false,
              facetable: false
            },
            filters: []
          },
          {
            definition: {
              key: 'bar',
              type: 'text',
              name: 'Name: bar',
              clustering_key: 'youtube',
              category: 'influencer',
              size: 'M',
              orderable: false,
              filterable: false,
              facetable: false
            },
            filters: []
          }
        ];

        assert.deepEqual(columns, updatedColumns);
        return Promise.resolve({
          columns: builderHelper(COLUMNS, buildColumn)
        });
      });
      const fetchRowsMock = sinon.stub(this.rowsFetcher, 'fetch').callsFake(() => {
        return Promise.resolve({ rows: [] });
      });

      await render(hbs`<HyperTableV2::ManageColumns @handler={{this.handler}} />`);

      await click('.upf-btn.upf-btn--primary');
      await click('[data-control-name="column_definition_toggle_checkbox_bar"] input');

      assert.ok(upsertColumnsMock.calledOnce);
      assert.ok(fetchRowsMock.calledOnce);
    });
  });
});
