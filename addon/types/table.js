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
      column.set('orderKey', column.orderKey || column.property);
      column.set('orderBy', column.orderBy || null);
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

    let orderedColumn = this.columns.find((c) => c.orderBy);

    if (orderedColumn) {
      _d = _d.sortBy(orderedColumn.property);

      if (orderedColumn.orderDirection === 'desc') {
        _d = _d.reverse();
      }
    }

    this.set('data', _d);
  },

  updateOrdering(column, orderBy) {
    this.columns.forEach((c) => c.set('orderBy', null));
    column.set('orderBy', orderBy);
  }
});
