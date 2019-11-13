import EmberObject from '@ember/object';
import { or } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { typeOf } from '@ember/utils';

import Column from '@upfluence/hypertable/types/column';

export default EmberObject.extend({
  columns: [],
  data: [],
  fields: [],
  fieldCategories: [],
  applyingFiltersOn: null,

  tetherInstance: null,
  tetherOn: null,

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
        size: column.size || 'M',
        filters: (column.filters || []).map((x) => EmberObject.create(x)),

        type: column.type || 'text',
        orderable: index !== 0 && column.orderable,
        filterable: index !== 0 && column.filterable,
        upsertable: column.upsertable || false,
        field
      });

      field.setProperties({
        visible: true,
        toggleable: index !== 0
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
  },

  triggerTetherContainer(on, elementClass, options) {
    if (this.tetherOn !== on) {
      this.set('tetherOn', on);

      if (this.tetherInstance) {
        this.tetherInstance.element.remove()
      }

      run.later(() => {
        if (this.tetherInstance) {
          this.tetherInstance.setOptions(options);
        } else {
          this.set('tetherInstance', new Tether(options));
        }

        document.querySelector(`.${elementClass}`).classList.add(
          `${elementClass}--visible`
        );

        this.set('tetherOn', on);
      });
    } else {
      this.set('tetherOn', null);

      if (this.tetherInstance) {
        this.destroyTetherInstance();
      }
    }
  },

  destroyTetherInstance() {
    this.tetherInstance.element.remove()
    this.tetherInstance.destroy();
    this.set('tetherInstance', null);
  }
});
