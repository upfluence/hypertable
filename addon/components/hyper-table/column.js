import SortableItem from 'ember-sortable/components/sortable-item';
import { computed, defineProperty, observer } from '@ember/object';
import { and, or } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { capitalize } from '@ember/string';
import { isEmpty } from '@ember/utils';

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

  _ordered: false,
  _filtered: false,

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

  _filtersChanged: observer('column.filters.@each', function () {
    this.set('_filtered', !isEmpty(this.column.filters));
  }),

  _tableStateListener() {
    this.set('_ordered', !isEmpty(this.column.orderBy));
    this.set('_filtered', !isEmpty(this.column.filters));
  },

  didReceiveAttrs() {
    if (this.column) {
      if (!this.column.renderingComponent) {
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

      this.addObserver(
        'manager.columns.@each.orderBy',
        this,
        this._tableStateListener
      );

      this.set('_ordered', !isEmpty(this.column.orderBy));
      this.set('_filtered', !isEmpty(this.column.filters));
    }
  },

  actions: {
    toggleFiltersPanel() {
      if (this.manager.applyingFiltersOn !== this.column.key) {
        this.set('manager.applyingFiltersOn', this.column.key);

        if (document.querySelector('.available-filters')) {
          document.querySelector('.available-filters').remove();
        }

        run.later(() => {
          let tetherOptions = {
            element: `#${this.elementId} .available-filters`,
            target: `#${this.elementId} header`,
            attachment: 'top center',
            targetAttachment: 'bottom left',
            offset: '-20px 0'
          };

          if (this.manager.tetherFilters) {
            this.manager.tetherFilters.setOptions(tetherOptions);
          } else {
            this.set('manager.tetherFilters', new Tether(tetherOptions));
          }

          document.querySelector('.available-filters').classList.add(
            'available-filters--visible'
          );
        });
      } else {
        this.set('manager.applyingFiltersOn', null);
        document.querySelector('.available-filters').remove()
        if (this.manager.tetherFilters) this.manager.tetherFilters.destroy();
      }
    },

    orderColumn() {
      if (this.manager.options.features.ordering && this.column.orderable) {
        let nextDirection = this.column.orderDirection === 'asc' ? 'desc' : 'asc';

        this.manager.updateOrdering(
          this.column, `${this.column.orderKey}:${nextDirection}`
        );
      }
    }
  }
});
