import EmberObject from '@ember/object';

import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import Column from '@upfluence/hypertable/types/column';

const field = (key, props = {}) => EmberObject.create({ key, type: 'text', ...props });

module('Unit | Type | table', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.table = this.owner.lookup('service:hypertable-manager').createTable({}, { onColumnsChange() {} });
  });

  module('updateColumns', function () {
    test('it keeps the columns that have a field and decorates them', function (assert) {
      const fields = [field('name', { size: 'L' }), field('score'), field('other')];
      this.table.updateFields(fields);

      this.table.updateColumns([
        { key: 'name', orderable: true, filterable: true },
        { key: 'unknown' },
        { key: 'score', orderable: true, filterable: true, filters: [{ key: 'lower_bound', value: '1' }] }
      ]);

      assert.deepEqual(
        this.table.columns.map((c) => c.key),
        ['name', 'score']
      );
      assert.strictEqual(this.table.columns[0].size, 'L');
      assert.false(this.table.columns[0].orderable);
      assert.true(this.table.columns[1].orderable);
      assert.strictEqual(this.table.columns[1].filters[0].value, '1');
      assert.strictEqual(this.table.columns[1].field, fields[1]);
      assert.true(fields[0].visible);
      assert.false(fields[0].toggleable);
      assert.true(fields[1].toggleable);
      assert.strictEqual(fields[2].visible, undefined);
    });
  });

  module('updateData', function () {
    test('it initializes the selection of the new rows', function (assert) {
      this.table.updateData([EmberObject.create({ id: 1 }), EmberObject.create({ id: 2 })]);

      assert.deepEqual(
        this.table.data.map((row) => row.selected),
        [false, false]
      );
    });

    test('it selects the new rows when every row is selected', function (assert) {
      this.table.set('_allRowsSelected', true);

      this.table.updateData([EmberObject.create({ id: 1 })]);

      assert.true(this.table.data[0].selected);
    });

    test('it keeps the selection of the rows that are already loaded', function (assert) {
      this.table.updateData([EmberObject.create({ id: 1 })]);
      this.table.data[0].set('selected', true);

      this.table.updateData([EmberObject.create({ id: 1 }), EmberObject.create({ id: 2 })]);

      assert.deepEqual(
        this.table.data.map((row) => row.selected),
        [true, false]
      );
    });

    test('it accepts an empty list', function (assert) {
      this.table.updateData([]);

      assert.strictEqual(this.table.data.length, 0);
    });
  });

  module('updateViews', function () {
    test('it only keeps the predefined views that are not already saved', function (assert) {
      this.table.updateViews([{ name: 'a' }], [{ name: 'a' }, { name: 'b' }]);

      assert.deepEqual(
        this.table.predefinedViews.map((v) => v.name),
        ['b']
      );
    });
  });

  module('toggleColumnVisibility', function () {
    test('it removes a visible column and adds it back', async function (assert) {
      const fields = [field('name'), field('score')];
      this.table.updateFields(fields);
      this.table.updateColumns([{ key: 'name' }, { key: 'score' }]);
      const notified = [];
      this.table.addObserver('columns.[]', () => notified.push(this.table.columns.length));

      assert.strictEqual(await this.table.toggleColumnVisibility(fields[1]), 'removal');
      assert.deepEqual(
        this.table.columns.map((c) => c.key),
        ['name']
      );
      assert.false(fields[1].visible);

      assert.strictEqual(await this.table.toggleColumnVisibility(fields[1]), 'addition');
      assert.deepEqual(
        this.table.columns.map((c) => c.key),
        ['name', 'score']
      );
      assert.true(fields[1].visible);
      assert.deepEqual(notified, [1, 2]);
    });
  });

  module('column', function () {
    test('applyFacets joins the identifiers of the facets', function (assert) {
      const onColumnsChange = (key) => assert.step(key);
      const column = Column.create({ manager: { hooks: { onColumnsChange } } });

      column.applyFacets('brand', [{ identifier: 'a' }, { identifier: 'b' }]);

      assert.deepEqual(column.filters, [{ key: 'brand', value: 'a,b' }]);

      column.applyFacets('brand', []);
      assert.deepEqual(column.filters, []);
      assert.verifySteps(['columns:change', 'columns:change']);
    });
  });
});
