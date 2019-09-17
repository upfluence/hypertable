import EmberObject from '@ember/object';
import { typeOf } from '@ember/utils';

import Column from '@upfluence/hypertable/types/column';

export default EmberObject.extend({
  columns: [],
  data: [],
  applyingFiltersOn: null,

  updateColumns(columns) {
    this.set('columns', columns.map((column) => {
      if (typeOf(column) !== 'instance') {
        column = Column.create(column);
      }

      column.set('visible', column.visible !== false);
      column.set('sortKey', column.sortKey || column.property);
      column.set('sortBy', column.sortBy || null);
      column.set(
        'filters',
        (column.filters || []).map((x) => EmberObject.create(x))
      );
      column.set('type', column.type || 'text');

      return column;
    }));
  },

  updateData(data) {
    let _d = data;

    let sortedColumn = this.columns.find((c) => c.sortBy);

    if (sortedColumn) {
      _d = _d.sortBy(sortedColumn.property);

      if (sortedColumn.sortBy.includes(':desc')) {
        _d = _d.reverse();
      }
    }

    this.set('data', _d);
  },

  updateSortBy(column, sortBy) {
    this.columns.forEach((c) => c.set('sortBy', null));
    column.set('sortBy', sortBy);
  }
});
