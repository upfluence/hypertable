import EmberObject from '@ember/object';
import { or } from '@ember/object/computed';
import { typeOf } from '@ember/utils';

import Column from '@upfluence/hypertable/types/column';
import Field from '@upfluence/hypertable/types/field';

export default EmberObject.extend({
  columns: [],
  data: [],
  fields: [],
  fieldCategories: [],
  applyingFiltersOn: null,

  /*
   * Configuration
   * =============
   *
   * Define which features of the datatable should be activated.
   *
   */
  _defaultOptions: {
    features: {
      selection: false,
      search: false,
      ordering: false,
      filtering: false
    }
  },
  options: or('_options', '_defaultOptions'),

  updateFields(fields) {
    this.set('fields', fields);
  },

  updateColumns(columns) {
    this.set('columns', columns.map((column, index) => {
      if (typeOf(column) !== 'instance') {
        column = Column.create(column);
      }

      let field = this.fields.findBy('key', column.key);

      column.setProperties({
        orderBy: column.orderBy || null,
        orderKey: column.orderKey || column.key,
        filters: (column.filters || []).map((x) => EmberObject.create(x)),

        type: column.type || 'text',
        orderable: index !== 0 && column.orderable,
        filterable: index !== 0 && column.filterable,
        field
      });

      return column;
    }));
  },

  updateData(data) {
    let _d = data;

    let orderedColumn = this.columns.find((c) => c.orderBy);

    if (orderedColumn) {
      _d = _d.sortBy(orderedColumn.key);

      if (orderedColumn.orderDirection === 'desc') {
        _d = _d.reverse();
      }
    }

    this.set('data', _d);
  },

  updateOrdering(column, orderBy) {
    this.columns.forEach((c) => c.set('orderBy', null));
    column.set('orderBy', orderBy);
  },

  updateFieldCategories(categories){
    this.set('fieldCategories', categories);
  },

  updateColumnValue(key, item, value) {
    item.set(key, value);
  },

  toggleColumnVisibility(field) {
    return new Promise((resolve, reject) => {
      let _c = this.columns.findBy('key', field.key);

      if (_c) {
        this.columns.removeObject(_c);
      } else {
        this.columns.pushObject(
          Column.create({ key: field.key, visible: true, field })
        )
      }

      resolve();
    });
  }
});
