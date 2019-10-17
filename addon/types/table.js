import EmberObject from '@ember/object';
import { or } from '@ember/object/computed';
import { typeOf } from '@ember/utils';

import Column from '@upfluence/hypertable/types/column';
import Field from '@upfluence/hypertable/types/field';

export default EmberObject.extend({
  columns: [],
  data: [],
  fields: [],
  columnCategories: [],
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
    this.set('fields', fields.map(({ property, title }) => {
      return Field.create({ property, title });
    }));
  },

  updateColumns(columns) {
    this.set('columns', columns.map((column, index) => {
      if (typeOf(column) !== 'instance') {
        column = Column.create(column);
      }

      let field = this.fields.findBy('property', column.property);

      column.setProperties({
        orderBy: column.orderBy || null,
        orderKey: column.orderKey || column.property,
        filters: (column.filters || []).map((x) => EmberObject.create(x)),

        // move to Field ?
        type: column.type || 'text',
        hasOrdering: (index === 0) ? false : (column.hasOrdering || false),
        hasFiltering: (index === 0) ? false : (column.hasFiltering || false),
        field
      });

      field.set('visible', true);

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
  },

  updateColumnCategories(columnCategories){
    this.set('columnCategories', columnCategories);
  },

  updateColumnValue(key, item, value) {
    item.set(key, value);
  },

  toggleColumnVisibility(field) {
    return new Promise((resolve, reject) => {
      let _c = this.columns.findBy('property', field.property);

      if (_c) {
        this.columns.removeObject(_c);
      } else {
        this.columns.pushObject(
          Column.create({ property: field.property, visible: true, field })
        )
      }

      resolve();
    });
  }
});
