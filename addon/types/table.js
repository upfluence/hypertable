import EmberObject, { computed } from '@ember/object';
import { or } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { isEmpty, typeOf } from '@ember/utils';
import { dasherize } from '@ember/string';

import Tether from 'tether';

import Column from '@upfluence/hypertable/types/column';
import { LocalStorageStore } from '@upfluence/hypertable/types/store';

const DEFAULT_RENDERERS = ['text', 'numeric', 'money', 'date', 'image', 'link'];

export default EmberObject.extend({
  columns: [],
  views: [],
  data: [],
  fields: [],
  fieldCategories: [],
  excludedItems: [],
  applyingFiltersOn: null,
  editStatus: [],
  tetherInstance: null,
  tetherOn: null,
  availableFieldsPanel: false,
  availableTableViews: false,
  updatingTableView: false,
  _allRowsSelected: false,
  _selectAllChecked: false,
  store: null,
  meta: {},

  /*
   * Configuration
   * =============
   *
   * Define which features of the datatable should be activated.
   *
   */
  _defaultOptions: {
    name: null,
    features: {
      selection: false,
      search: false,
      ordering: false,
      filtering: false,
      tableViews: false,
      localStorage: false
    },
    selectionIntlKeyPath: null
  },
  options: or('_options', '_defaultOptions'),

  /*
   * Event Hooks
   * ===========
   *
   * Actions to be called to react to various events happening on the datatable
   *
   * Available Hooks:
   *   onColumnsChange, onBottomReached,
   *   onSearchQueryChange, onRowClicked,
   *   onLiveEdit
   */
  hooks: {},

  init() {
    this._super(...arguments);

    if (this.options?.features?.localStorage) {
      if (!this.options.name) {
        throw new Error(
          '[Hypertable] Trying to use localStorage store without a store name. Please set "options.name".'
        );
      }

      this.set('store', new LocalStorageStore(this.options.name));
    }
  },

  // eslint-disable-next-line ember/no-deeply-nested-dependent-keys-with-each
  appliedFilters: computed('columns.@each.filters.[]', function () {
    return this.columns
      .map((column) => {
        if (!isEmpty(column.filters)) {
          let _c = {};
          _c[column.key] = column.filters;
          return _c;
        }
      })
      .compact();
  }),

  updateFields(fields) {
    this.set('fields', fields);
  },

  updateColumns(columns) {
    this.set(
      'columns',
      columns
        .filter((column) => this.fields.findBy('key', column.key))
        .map((column, index) => {
          if (typeOf(column) !== 'instance') {
            column = Column.create(column);
          }

          let field = this.fields.findBy('key', column.key);

          column.setProperties({
            manager: this,
            orderBy: column.orderBy || null,
            orderKey: column.orderKey || column.key,
            size: field.size || 'M',
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
        })
    );
  },

  updateData(data) {
    if (data.length > 0) {
      let undefinedSelectedData = data.filterBy('selected', undefined);
      undefinedSelectedData.forEach((undefinedSelectedRow) => {
        let existingRow = this.data.find((row) => row.id === undefinedSelectedRow.id);
        if (!existingRow) return;
        undefinedSelectedRow.selected = existingRow.selected;
      });

      let newData = data.filterBy('selected', undefined);
      this._allRowsSelected ? newData.setEach('selected', true) : newData.setEach('selected', false);
    }

    this.set('data', data);
  },

  removeData(data) {
    let removeRowNumber = 0;
    data.forEach((removeRow) => {
      const rowDataIndex = this.data.findIndex((row) => row.id === removeRow.id);
      if (rowDataIndex > -1) {
        this.data.splice(rowDataIndex, 1);
        removeRowNumber++;
      }
    });
    this.set('meta.total', this.meta.total - removeRowNumber);
    this.set('data', this.data);
    this.resetSelection();
  },

  resetSelection() {
    this.set('_allRowsSelected', false);
    this.set('_selectAllChecked', false);
    this.set('excludedItems', []);
  },

  updateViews(views, predefinedViews) {
    this.set('views', views);

    if (predefinedViews) {
      predefinedViews = predefinedViews.filter((view) => {
        return views.filterBy('name', view.name).length === 0;
      });
      this.set('predefinedViews', predefinedViews);
    }
  },

  updateOrdering(column, orderBy) {
    this.columns.forEach((c) => c.set('orderBy', null));
    column.set('orderBy', orderBy);
    this.hooks.onColumnsChange('columns:change');
  },

  updateFieldCategories(categories) {
    this.set('fieldCategories', categories);
  },

  formatField(field) {
    if (field.type === 'string') field.set('type', 'text');
    if (field.type === 'integer') field.set('type', 'numeric');
    if (field.type === 'timestamp') field.set('type', 'date');
    if (field.type === 'rating') field.set('autosave', true);

    if (!DEFAULT_RENDERERS.includes(field.type)) {
      field.renderingComponent = field.renderingComponent || `crm/column-renderers/${dasherize(field.type)}`;

      if (field.filterable) {
        field.filtersRenderingComponent =
          field.filtersRenderingComponent || `crm/filters-renderers/${dasherize(field.type)}`;
      }
    }
  },

  toggleColumnVisibility(field, column) {
    return new Promise((resolve) => {
      let _c = this.columns.findBy('key', field.key);
      let _action = null;

      if (_c) {
        field.set('visible', false);
        this.columns.removeObject(_c);
        _action = 'removal';
      } else {
        this.formatField(field);
        field.set('visible', true);

        let newColumn = Column.create({
          key: field.key,
          type: field.type,
          renderingComponent: field.renderingComponent,
          filtersRenderingComponent: field.filtersRenderingComponent,
          upsertable: field.upsertable,
          orderable: field.orderable,
          filterable: field.filterable,
          orderKey: field.orderKey || field.key,
          manager: this,
          field
        });

        if (column && column.order) {
          newColumn.orderBy = `${column.order.key}:${column.order.direction}`;
        }

        if (column && column.filters) {
          newColumn.filters = column.filters;
        }

        this.columns.pushObject(newColumn);

        _action = 'addition';
      }

      resolve(_action);
    });
  },

  refreshScrollableStatus() {
    let table = document.querySelector('.hypertable');
    this.set('isScrollable', table.scrollWidth > table.offsetWidth);
  },

  triggerTetherContainer(on, elementClass, options, backdrop = true, width) {
    if (this.tetherOn !== on) {
      this.set('tetherOn', on);

      // eslint-disable-next-line ember/no-incorrect-calls-with-inline-anonymous-functions
      scheduleOnce('afterRender', this, () => {
        var expandableList = document.querySelector(`.${elementClass}`);

        if (width) {
          expandableList.style.width = `${width}px`;
        }

        if (this.tetherInstance) {
          this.tetherInstance.setOptions(options);
        } else {
          this.set('tetherInstance', new Tether(options));
        }

        setTimeout(() => {
          expandableList.classList.add(`${elementClass}--visible`);
        }, 200);

        this.setProperties({
          tetherOn: on,
          tetherBackdrop: backdrop
        });
      });
    } else {
      this.set('tetherOn', null);

      if (this.tetherInstance && this.tetherInstance.element) {
        this.destroyTetherInstance();
      }
    }
  },

  destroyTetherInstance() {
    if (this.tetherInstance) {
      this.tetherInstance.element.remove();
      this.tetherInstance.destroy();
      this.set('tetherInstance', null);
      this.set('tetherOn', null);
    }
  },

  getStoreState() {
    return this.store?.getState();
  },

  updateStoreState() {
    this.store?.update(this.columns);
  }
});
