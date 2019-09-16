import EmberObject from '@ember/object';
import { typeOf } from '@ember/utils';

import Column from '@upfluence/hypertable/types/column';

export default EmberObject.extend({
  columns: [],
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

  updateSortBy(column, sortBy) {
    this.columns.forEach((c) => c.set('sortBy', null));
    column.set('sortBy', sortBy);
  }
});
