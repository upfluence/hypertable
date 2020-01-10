import SortableItem from 'ember-sortable/components/sortable-item';
import { computed, defineProperty, observer } from '@ember/object';
import { and, notEmpty, or } from '@ember/object/computed';
import { capitalize } from '@ember/string';

const AVAILABLE_RENDERERS = [
  'text', 'numeric', 'money', 'date', 'image', 'list'
];

export default SortableItem.extend({
  classNames: ['hypertable__column'],
  classNameBindings: [
    '_columnSize',
    '_orderingClass',
    '_ordered:hypertable__column--ordered',
    '_filtered:hypertable__column--filtered',

    'isText:hypertable__column--text',
    'isNumeric:hypertable__column--numeric',
    'isMoney:hypertable__column--numeric',
    'isImage:hypertable__column--image',
    'isList:hypertable__column--list',
  ],

  _ordered: notEmpty('column.orderBy'),
  _filtered: notEmpty('column.filters'),

  _columnSize: computed('column.size', function() {
    return `hypertable__column--size-${this.column.size}`;
  }),

  _orderingClass: computed('_ordered', 'column.orderDirection', function() {
    if (this._ordered) {
      return `hypertable__column--ordered-${this.column.orderDirection}`;
    }
  }),

  _orderable: and('manager.options.features.ordering', 'column.orderable'),
  _filterable: and('manager.options.features.filtering', 'column.filterable'),
  _supportsOrderingOrFiltering: or('_orderable', '_filterable'),

  _typeInferredFiltersRenderingComponent: computed('column.type', function() {
    if (AVAILABLE_RENDERERS.includes(this.column.type)) {
      return `hyper-table/filters-renderers/${this.column.type}`;
    }
  }),

  _filtersRenderingComponent: or(
    'column.filtersRenderingComponent', '_typeInferredFiltersRenderingComponent'
  ),

  didReceiveAttrs() {
    if (this.column && !this.column.renderingComponent) {
      AVAILABLE_RENDERERS.forEach((rendererType) => {
        defineProperty(
          this,
          `is${capitalize(rendererType)}`,
          computed('column.type', function() {
            return this.column.type === rendererType;
          })
        );
      });
    }
  },

  actions: {
    toggleFiltersPanel() {
      let isFirstColumn =
        this.manager.columns.indexOf(this.column) === 1;
      let isMedium = this.column.size === 'M';
      let isSmall = this.column.size === 'S'

      if(this.manager.tetherOn !== this.column.key) {
        this.manager.destroyTetherInstance();
      }

      this.manager.triggerTetherContainer(
        this.column.key,
        'available-filters',
        {
          element: `#${this.elementId} .available-filters`,
          target: `#${this.elementId} header`,
          attachment: 'top right',
          targetAttachment: 'bottom right',
          offset: isFirstColumn ? `0 ${isMedium? '-50px' : isSmall? '-130px' : '0' }` : '0 0'
        },
        true
      );
    },

    orderColumn() {
      if (this.manager.options.features.ordering && this.column.orderable) {
        let nextDirection = this.column.orderDirection === 'desc' ? 'asc' : 'desc';

        this.manager.updateOrdering(
          this.column, `${this.column.orderKey}:${nextDirection}`
        );
      }
    }
  }
});
