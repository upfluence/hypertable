import EmberObject, { computed } from '@ember/object';
import { or } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { isEmpty, typeOf } from '@ember/utils';
import { dasherize } from '@ember/string';

import Column from '@upfluence/hypertable/types/column';

const DEFAULT_RENDERERS = [
  'text', 'numeric', 'money', 'date', 'image'
];

export default EmberObject.extend({
  columns: [],
  views: [],
  data: [],
  fields: [],
  fieldCategories: [],
  applyingFiltersOn: null,
  editStatus: [],
  tetherInstance: null,
  tetherOn: null,
  availableFieldsPanel: false,
  availableTableViews: false,
  updatingTableView: false,
  _allRowsSelected: false,

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
    },
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


  appliedFilters: computed('columns.@each.filters.[]', function() {
    return this.columns.map((column) => {
      if (!isEmpty(column.filters)) {
        let _c = {}
        _c[column.key] = column.filters;
        return _c;
      }
    }).compact();
  }),

  updateFields(fields) {
    this.set('fields', fields);
  },

  updateColumns(columns) {
    this.set('columns', columns.filter((column) => this.fields.findBy('key', column.key)).map((column, index) => {
      if (typeOf(column) !== 'instance') {
        column = Column.create(column);
      }

      let field = this.fields.findBy('key', column.key);

      column.setProperties({
        manager: this,
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
    data.setEach('selected', this._allRowsSelected);
    this.set('data', data);
  },

  updateViews(views, predefinedViews) {
    this.set('views', views);

    if(predefinedViews) {
      predefinedViews = predefinedViews.filter((view)=> {
        return views.filterBy('name', view.name).length === 0;
      })
      this.set('predefinedViews', predefinedViews);
    }
  },

  updateOrdering(column, orderBy) {
    this.columns.forEach((c) => c.set('orderBy', null));
    column.set('orderBy', orderBy);
    this.hooks.onColumnsChange('columns:change');
  },

  updateFieldCategories(categories){
    this.set('fieldCategories', categories);
  },

  formatField(field) {
    if (field.type === 'string') field.set('type', 'text');
    if (field.type === 'integer') field.set('type', 'numeric');
    if (field.type === 'timestamp') field.set('type', 'date');
    if (field.type === 'rating') field.set('autosave', true);

    if (!DEFAULT_RENDERERS.includes(field.type)) {
      field.set('renderingComponent', `crm/column-renderers/${dasherize(field.type)}`);
      if (field.filterable) {
        field.filtersRenderingComponent = `crm/filters-renderers/${dasherize(field.type)}`;
      }
    }
  },

  toggleColumnVisibility(field, column) {
    return new Promise((resolve, reject) => {
      let _c = this.columns.findBy('key', field.key);
      let _action = null;

      if (_c) {
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
          orderKey: field.orderKey || field.key,
          manager: this,
          field
        });

        if(column && column.order) {
          newColumn.orderBy = `${column.order.key}:${column.order.direction}`;
        }

        if(column && column.filters) {
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

      scheduleOnce('afterRender', this, () => {
        var expandableList = document.querySelector(`.${elementClass}`);

        if(width) {
          expandableList.style.width = `${width}px`;
        }

        if (this.tetherInstance) {
          this.tetherInstance.setOptions(options);
        } else {
          this.set('tetherInstance', new Tether(options));
        }

        setTimeout(() => {
          expandableList.classList.add(
            `${elementClass}--visible`
          );
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
      this.tetherInstance.element.remove()
      this.tetherInstance.destroy();
      this.set('tetherInstance', null);
      this.set('tetherOn', null);
    }
  }
});
