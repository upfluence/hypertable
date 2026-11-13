import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { click, fillIn, render, settled, triggerEvent } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

const FEATURES = { selection: true, search: true, ordering: true, filtering: true, tableViews: true };

const buildTable = (owner, { type = 'text', hooks = {}, features = FEATURES } = {}) => {
  const table = owner.lookup('service:hypertable-manager').createTable({ features }, hooks);

  table.updateFields([
    EmberObject.create({
      key: 'name',
      name: 'Name',
      categories: ['general'],
      visible: false,
      type: 'text',
      toggleable: true,
      size: 'M'
    }),
    EmberObject.create({
      key: 'score',
      name: 'Score',
      title: 'Score title',
      categories: ['general'],
      visible: false,
      type: 'text',
      toggleable: true,
      size: 'M'
    }),
    EmberObject.create({
      key: 'extra',
      name: 'Extra',
      categories: ['other'],
      visible: false,
      type: 'text',
      toggleable: true,
      size: 'M'
    })
  ]);
  table.updateColumns([
    { key: 'name', type: 'text', orderable: false, filterable: false },
    { key: 'score', type, orderable: true, filterable: true }
  ]);
  table.set('editStatus', []);
  table.updateData([
    EmberObject.create({ id: 1, name: 'foo', score: 10 }),
    EmberObject.create({ id: 2, name: 'bar', score: 20 })
  ]);
  table.set('meta', { total: 2 });
  table.updateFieldCategories([
    { key: 'general', label: 'General' },
    { key: 'other', label: 'Other' }
  ]);

  return table;
};

module('Integration | Component | hyper-table', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.documentClick = sinon.spy();
    document.addEventListener('click', this.documentClick);
  });

  hooks.afterEach(function () {
    document.removeEventListener('click', this.documentClick);
  });

  module('toolbar', function () {
    test('toggling the fields panel does not bubble and flips the panel', async function (assert) {
      this.table = buildTable(this.owner);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      assert.dom('.available-fields-wrapper').hasClass('invisible');

      await click('.fields-manager-toggle');

      assert.true(this.table.availableFieldsPanel);
      assert.dom('.available-fields-wrapper').hasClass('visible');
      assert.false(this.table.availableTableViews);
      assert.false(this.documentClick.called);
    });

    test('toggling the views panel does not bubble and closes the fields panel', async function (assert) {
      this.table = buildTable(this.owner);
      this.table.set('availableFieldsPanel', true);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      await click('.views-manager-toggle');

      assert.true(this.table.availableTableViews);
      assert.false(this.table.availableFieldsPanel);
      assert.false(this.documentClick.called);
    });

    test('clicking outside the fields panel closes it', async function (assert) {
      this.table = buildTable(this.owner);

      await render(
        hbs`<div class="outside">outside</div><HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`
      );
      await click('.fields-manager-toggle');
      assert.true(this.table.availableFieldsPanel);

      await click('.outside');

      assert.false(this.table.availableFieldsPanel);
    });

    test('clicking outside the views panel closes it', async function (assert) {
      this.table = buildTable(this.owner);

      await render(
        hbs`<div class="outside">outside</div><HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`
      );
      await click('.views-manager-toggle');
      assert.true(this.table.availableTableViews);

      await click('.outside');

      assert.false(this.table.availableTableViews);
    });

    test('selecting a field category marks it active', async function (assert) {
      this.table = buildTable(this.owner);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      assert.dom('.field-category--active').exists({ count: 1 }).hasText('All Fields');

      await click('[data-control-name="field_category_toggle_other"]');

      assert.dom('.field-category--active').exists({ count: 1 }).hasText('Other');
      assert.dom('.available-fields-wrapper__fields .field').exists({ count: 1 }).hasText('Extra');

      await click('.available-fields-wrapper__categories .field-category');

      assert.dom('.field-category--active').hasText('All Fields');
    });

    test('searching in the fields panel filters the fields', async function (assert) {
      this.table = buildTable(this.owner);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      await fillIn('.available-fields-wrapper input', 'ext');

      assert.dom('.available-fields-wrapper__fields .field').exists({ count: 1 }).hasText('Extra');
    });

    test('clicking a field toggles the column visibility', async function (assert) {
      const onColumnsChange = sinon.spy();
      this.table = buildTable(this.owner, { hooks: { onColumnsChange } });

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      assert.strictEqual(this.table.columns.length, 2);

      await click('.available-fields-wrapper__fields .field:nth-child(2) .margin-left-px-6');
      await settled();

      assert.true(onColumnsChange.calledWith('columns:change', { visibilityChanged: true }));
      assert.strictEqual(this.table.columns.length, 3);
    });

    test('resetting the filters clears them and the selection', async function (assert) {
      const onColumnsChange = sinon.spy();
      this.table = buildTable(this.owner, { hooks: { onColumnsChange } });
      this.table.columns[1].set('filters', [{ key: 'value', value: 'x' }]);
      this.table.data[0].set('selected', true);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      await click('[data-control-name="table_reset_filters"]');

      assert.strictEqual(this.table.columns[1].filters.length, 0);
      assert.false(this.table.data[0].selected);
      assert.true(onColumnsChange.calledWith('columns:change'));
    });

    test('clearing the search resets the first column filters and notifies the hook', async function (assert) {
      const onSearchQueryChange = sinon.spy();
      this.table = buildTable(this.owner, { hooks: { onSearchQueryChange, onColumnsChange() {} } });
      this.table.columns[0].set('filters', [{ key: 'value', value: 'foo' }]);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      assert.dom('.hypertable__upper-header .fa-times').exists();

      await click('.hypertable__upper-header .fa-times');

      assert.strictEqual(this.table.columns[0].filters.length, 0);
      assert.true(onSearchQueryChange.calledWith(''));
      assert.dom('.hypertable__upper-header .fa-times').doesNotExist();
    });
  });

  module('selection', function () {
    test('the header checkbox selects and unselects every row', async function (assert) {
      this.table = buildTable(this.owner);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      await click('[data-control-name="row_select_all_toggle_checkbox"]');

      assert.true(this.table.data.every((row) => row.selected));
      assert.true(this.table._selectAllChecked);
      assert.dom('.selected-count').hasText('2');
      assert.true(this.table._allRowsSelected);

      await click('[data-control-name="row_select_all_toggle_checkbox"]');

      assert.true(this.table.data.every((row) => !row.selected));
      assert.false(this.table._selectAllChecked);
      assert.false(this.table._allRowsSelected);
    });

    test('a row checkbox selects the row', async function (assert) {
      this.table = buildTable(this.owner);
      this.table.set('meta', { total: 5 });

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      await click('[data-control-name="row_select_toggle_checkbox"]');

      assert.true(this.table.data[0].selected);
      assert.false(this.table.data[1].selected);
      assert.true(this.table._selectAllChecked);
      assert.dom('.selected-count').hasText('1');
    });

    test('the selection bar selects every row globally and clears the selection', async function (assert) {
      this.table = buildTable(this.owner);
      this.table.set('meta', { total: 5 });
      this.table.data[0].set('selected', true);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      await click('.select-all-container');

      assert.true(this.table._allRowsSelected);
      assert.true(this.table._selectAllChecked);
      assert.true(this.table.data.every((row) => row.selected));

      await click('.clear-container');

      assert.false(this.table._allRowsSelected);
      assert.false(this.table._selectAllChecked);
      assert.true(this.table.data.every((row) => !row.selected));
    });
  });

  module('hover', function () {
    test('hovering a row toggles its hovered state', async function (assert) {
      this.table = buildTable(this.owner);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      const cell = this.element.querySelector('.hypertable__sticky-columns .hypertable__column:last-child > div');

      await triggerEvent(cell, 'mouseover');
      assert.true(this.table.data[0].hovered);

      await triggerEvent(cell, 'mouseout');
      assert.false(this.table.data[0].hovered);
    });
  });

  module('column', function () {
    test('clicking the header orders the column without bubbling', async function (assert) {
      const onColumnsChange = sinon.spy();
      this.table = buildTable(this.owner, { hooks: { onColumnsChange } });

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      await click('.hypertable__column--ordered, .hypertable > .hypertable__column .cell-header');

      assert.strictEqual(this.table.columns[1].orderBy, 'score:desc');
      assert.true(onColumnsChange.calledWith('columns:change'));
      assert.dom('.order-direction').exists();
      assert.false(this.documentClick.called);

      await click('.hypertable > .hypertable__column .cell-header');

      assert.strictEqual(this.table.columns[1].orderBy, 'score:asc');
    });

    test('the filter icon opens the filters panel without bubbling', async function (assert) {
      this.table = buildTable(this.owner);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      await click('[data-control-name="table_column_filter_sort_toggle_score"] .fa-filter');

      assert.strictEqual(this.table.tetherOn, 'score');
      assert.dom('.available-filters', document).exists();
      this.table.destroyTetherInstance();
      assert.false(this.documentClick.called);
    });
  });

  module('filters renderers', function () {
    ['text', 'numeric', 'money'].forEach((type) => {
      module(type, function () {
        test('it orders, resets and removes the column', async function (assert) {
          const onColumnsChange = sinon.spy();
          this.table = buildTable(this.owner, { type, hooks: { onColumnsChange } });

          this.column = this.table.columns[1];
          this.renderer = `hyper-table/filters-renderers/${type}`;

          await render(hbs`{{component this.renderer column=this.column manager=this.table}}`);

          await click('[data-control-name="oss-toggle-button-option-score:asc"]');
          assert.strictEqual(this.table.columns[1].orderBy, 'score:asc');

          onColumnsChange.resetHistory();
          this.table.columns[1].set('filters', [{ key: 'existence', value: 'with' }]);

          const button = (label) =>
            [...this.element.querySelectorAll('button')].find((b) => b.textContent.includes(label));
          await click(button('Clear filters'));

          assert.strictEqual(this.table.columns[1].filters.length, 0);
          assert.strictEqual(this.table.columns[1].orderBy, null);
          assert.true(onColumnsChange.called);

          await click(button('Remove field'));
          await settled();

          assert.strictEqual(this.table.columns.length, 1);
          assert.true(onColumnsChange.calledWith('columns:change', { visibilityChanged: true }));
        });
      });
    });
  });

  module('facetting', function () {
    test('toggling a facet applies it and notifies', async function (assert) {
      const onToggleAppliedFacet = sinon.spy();
      this.onToggleAppliedFacet = onToggleAppliedFacet;
      this.facet = EmberObject.create({ identifier: 'a', formattedIdentifier: 'A', count: 3, applied: false });
      this.column = EmberObject.create({ applyFacets: sinon.spy() });

      await render(
        hbs`<HyperTable::Facetting
          @facets={{array this.facet}}
          @column={{this.column}}
          @filteringKey="foo"
          @onToggleAppliedFacet={{this.onToggleAppliedFacet}}
        />`
      );
      await click('.upf-checkbox');

      assert.true(this.facet.applied);
      assert.true(onToggleAppliedFacet.calledWith(this.facet));
      assert.dom('.hypertable__facetting-item span').hasClass('text-style-bold');
    });
  });

  module('views', function () {
    test('the add view button opens the modal without bubbling and the view is added', async function (assert) {
      const onAddView = sinon.spy();
      this.noop = () => {};
      this.manager = EmberObject.create({
        availableTableViews: true,
        views: [],
        predefinedViews: [],
        hooks: { onAddView }
      });

      await render(hbs`<HyperTable::Views @manager={{this.manager}} @closeAvailableViews={{this.noop}} />`);
      await click('.table-views-wrapper button');

      assert.false(this.documentClick.called);
      assert.dom('[data-control-name="modal_create_view_input"]').exists();

      await fillIn('[data-control-name="modal_create_view_input"]', 'my view');
      await click('.oss-modal-dialog button.upf-btn--primary, .oss-modal-dialog button:last-of-type');

      assert.true(onAddView.calledWith('my view'));
    });

    test('a predefined view is added and removed from the predefined list', async function (assert) {
      const onAddView = sinon.spy();
      const onSelectView = sinon.spy();
      this.view = { name: 'predef', table: { foo: 'bar' } };
      this.noop = () => {};
      this.manager = EmberObject.create({
        availableTableViews: true,
        views: [],
        predefinedViews: A([this.view]),
        hooks: { onAddView, onSelectView }
      });

      await render(hbs`<HyperTable::Views @manager={{this.manager}} @closeAvailableViews={{this.noop}} />`);
      assert.dom('.views-container hr').exists();
      await click('.views-container .hypertable__view, .views-container > div');

      assert.true(onAddView.calledWith('predef', { foo: 'bar' }));
      assert.true(onSelectView.calledWith(this.view));
      assert.strictEqual(this.manager.predefinedViews.length, 0);
    });
  });

  module('cell renderers', function () {
    const cell = (table, key = 'name', index = 0) => ({
      item: table.data[index],
      column: table.columns.find((c) => c.key === key)
    });

    test('link: the copy button copies the value without bubbling', async function (assert) {
      assert.expect(2);

      const writeText = sinon.stub(navigator.clipboard, 'writeText').resolves();
      this.table = buildTable(this.owner);
      this.table.columns[0].set('type', 'link');
      Object.assign(this, cell(this.table));
      this.item.set('name', 'https://example.com');

      try {
        await render(
          hbs`<HyperTable::CellRenderers::Link @item={{this.item}} @column={{this.column}} @manager={{this.table}} />`
        );
        await click('button');

        assert.true(writeText.calledWith('https://example.com'));
        assert.false(this.documentClick.called);
      } finally {
        writeText.restore();
      }
    });

    ['Text', 'Numeric'].forEach((renderer) => {
      test(`${renderer.toLowerCase()}: the add value placeholder starts the edition`, async function (assert) {
        this.table = buildTable(this.owner, { hooks: { onLiveEdit: sinon.spy() } });
        Object.assign(this, cell(this.table));
        this.column.set('upsertable', true);
        this.item.set('name', null);
        this.renderer = `hyper-table/cell-renderers/${renderer.toLowerCase()}`;

        await render(hbs`{{component this.renderer item=this.item column=this.column manager=this.table}}`);
        await click('span');

        assert.strictEqual(this.table.editStatus.length, 1);
        assert.strictEqual(this.table.editStatus[0].status, 'editing');
        assert.strictEqual(this.table.editStatus[0].key, 'name');
      });
    });

    test('text: leaving the input saves through the live edit hook', async function (assert) {
      const onLiveEdit = sinon.spy();
      this.table = buildTable(this.owner, { hooks: { onLiveEdit } });
      Object.assign(this, cell(this.table));
      this.column.set('upsertable', true);

      await render(
        hbs`<HyperTable::CellRenderers::Text @item={{this.item}} @column={{this.column}} @manager={{this.table}} />`
      );
      await fillIn('input', 'edited');
      await triggerEvent('input', 'focusout');

      assert.true(onLiveEdit.calledOnce);
      assert.strictEqual(onLiveEdit.firstCall.args[0].value, 'edited');
      assert.strictEqual(onLiveEdit.firstCall.args[0].key, 'name');
    });

    test('list: the container toggles the list without bubbling and items open their url', async function (assert) {
      assert.expect(7);

      this.table = buildTable(this.owner);
      Object.assign(this, cell(this.table));
      this.column.set('type', 'list');
      this.item.set(
        'name',
        A([
          { id: 1, name: 'one' },
          { id: 2, name: 'two', locked: true }
        ])
      );
      const open = sinon.stub(window, 'open');

      try {
        await render(
          hbs`<HyperTable::CellRenderers::List @item={{this.item}} @column={{this.column}} @manager={{this.table}} @url="/u/" />`
        );
        assert.dom('.list-container').exists();
        assert.dom('.list-container > div').hasText('one');

        await click('.list-container');
        assert.strictEqual(this.table.tetherOn, this.element.querySelector('.cell-container').id);
        assert.dom('.expandable-list__item', document).exists({ count: 2 });
        assert.false(this.documentClick.called);

        const items = document.querySelectorAll('.expandable-list__item');
        await click(items[0]);
        assert.true(open.calledWith('/u/1', '_blank'));

        open.resetHistory();
        await click(items[1]);
        assert.false(open.called);
      } finally {
        open.restore();
        this.table.destroyTetherInstance();
      }
    });
  });

  module('empty state', function () {
    test('it scrolls the empty state into view', async function (assert) {
      this.table = buildTable(this.owner);
      this.table.updateData([]);
      this.table.set('meta', { total: 0 });

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);

      assert.dom('.hypertable__state--empty').exists();
    });
  });
  module('arrays', function () {
    test('the field categories are sorted by label', async function (assert) {
      this.table = buildTable(this.owner);
      this.table.updateFieldCategories([
        { key: 'z', label: 'Zeta' },
        { key: 'a', label: 'Alpha' },
        { key: 'm', label: 'Mu' }
      ]);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);

      assert.deepEqual(
        [...this.element.querySelectorAll('.field-category')].map((c) => c.textContent.trim()),
        ['All Fields', 'Alpha', 'Mu', 'Zeta']
      );
    });

    test('the first column filters feed the search input and clear with the search', async function (assert) {
      this.table = buildTable(this.owner, { hooks: { onColumnsChange() {}, onSearchQueryChange() {} } });
      this.table.columns[0].set('filters', [{ key: 'value', value: 'foo' }]);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);

      assert.dom('.hypertable__upper-header [data-control-name="table_search_input"] input').hasValue('foo');

      this.table.columns[0].set('filters', [{ key: 'value', value: 'bar' }]);
      await settled();

      assert.dom('.hypertable__upper-header [data-control-name="table_search_input"] input').hasValue('bar');
    });

    test('reordering the columns keeps the first one and notifies the hook', async function (assert) {
      const onColumnsChange = sinon.spy();
      this.table = buildTable(this.owner, { hooks: { onColumnsChange } });
      this.table.fields.find((f) => f.key === 'extra').set('visible', true);
      this.table.updateColumns([
        ...this.table.columns,
        { key: 'extra', type: 'text', orderable: true, filterable: true }
      ]);

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      const component =
        this.owner.lookup('-view-registry:main')[this.element.querySelector('.hypertable-container').id];
      const [first, score, extra] = this.table.columns;

      component.reorderColumns([score, extra]);
      assert.false(onColumnsChange.called);

      component.reorderColumns([extra, score]);
      assert.true(onColumnsChange.calledWith('columns:reorder'));
      assert.deepEqual(
        this.table.columns.map((c) => c.key),
        [first.key, 'extra', 'score']
      );
    });

    test('removing then adding a column updates the rendered columns', async function (assert) {
      this.table = buildTable(this.owner, { hooks: { onColumnsChange() {} } });

      await render(hbs`<HyperTable @manager={{this.table}} @meta={{this.table.meta}} />`);
      assert.dom('.hypertable > .hypertable__column').exists({ count: 1 });

      await this.table.toggleColumnVisibility(this.table.fields.find((f) => f.key === 'score'));
      await settled();
      assert.dom('.hypertable > .hypertable__column').doesNotExist();

      await this.table.toggleColumnVisibility(this.table.fields.find((f) => f.key === 'score'));
      await settled();
      assert.dom('.hypertable > .hypertable__column').exists({ count: 1 });
    });

    test('a predefined view disappears from the list once added', async function (assert) {
      this.view = { name: 'predef', table: {} };
      this.noop = () => {};
      this.manager = EmberObject.create({
        availableTableViews: true,
        views: [],
        predefinedViews: [this.view],
        hooks: { onAddView() {}, onSelectView() {} }
      });

      await render(hbs`<HyperTable::Views @manager={{this.manager}} @closeAvailableViews={{this.noop}} />`);
      assert.dom('.views-container hr').exists();

      await click('.views-container > div');

      assert.dom('.views-container hr').doesNotExist();
    });

    test('the editing status of a cell is rendered once the edition starts', async function (assert) {
      this.table = buildTable(this.owner, { hooks: { onLiveEdit() {} } });
      this.item = this.table.data[0];
      this.column = this.table.columns[0];
      this.column.set('upsertable', true);
      this.item.set('name', null);

      await render(
        hbs`<HyperTable::CellRenderers::Text @item={{this.item}} @column={{this.column}} @manager={{this.table}} />`
      );
      await click('span');

      assert.dom('.cell-container').hasClass('editing');
      assert.strictEqual(this.table.editStatus.length, 1);
    });

    test('list: it renders the first element of a list of strings', async function (assert) {
      this.table = buildTable(this.owner);
      this.item = this.table.data[0];
      this.column = this.table.columns[0];
      this.item.set('name', ['alpha', 'beta', 'gamma']);

      await render(
        hbs`<HyperTable::CellRenderers::List @item={{this.item}} @column={{this.column}} @manager={{this.table}} />`
      );

      assert.dom('.list-container > div').hasText('alpha');
      assert.dom('.list-elements').includesText('+2 more');
    });

    test('list: it renders the first name of a list of objects', async function (assert) {
      this.table = buildTable(this.owner);
      this.item = this.table.data[0];
      this.column = this.table.columns[0];
      this.item.set('name', [
        { id: 1, name: 'one' },
        { id: 2, name: 'two' }
      ]);

      await render(
        hbs`<HyperTable::CellRenderers::List @item={{this.item}} @column={{this.column}} @manager={{this.table}} />`
      );

      assert.dom('.list-container > div').hasText('one');
      assert.dom('.list-elements').includesText('+1 more');
    });
  });
});
