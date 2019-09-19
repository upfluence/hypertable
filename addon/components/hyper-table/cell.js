import Component from '@ember/component';
import { computed, defineProperty, observer } from '@ember/object';
import { or } from '@ember/object/computed';
import { capitalize } from '@ember/string';
import { isEmpty } from '@ember/utils';

const AVAILABLE_RENDERERS = [
  'text', 'numeric', 'money', 'date', 'image'
];

export default Component.extend({
  classNames: ['hypertable__cell'],
  classNameBindings: [
    'header:hypertable__cell--header',
    'item.selected:hypertable__cell--selected',

    'loading:hypertable__cell--loading',
    '_ordered:hypertable__cell--ordered',
    '_filtered:hypertable__cell--filtered',

    'isNumeric:hypertable__cell--numeric',
    'isMoney:hypertable__cell--numeric',
    'isImage:hypertable__cell--image',
    'onRowClicked:hypertable__cell--clickable'
  ],

  header: false,
  selection: false,
  loading: false,

  _ordered: false,
  _filtered: false,
  _showFiltersPanel: false,

  _orderingIconClass: computed('_ordered', function() {
    if (this._ordered) {
      if (this.column.orderDirection === 'asc') {
        return 'fa-long-arrow-up'
      } else {
        return 'fa-long-arrow-down';
      }
    }
  }),

  _typeInferredRenderingComponent: computed('column.type', function() {
    if (AVAILABLE_RENDERERS.includes(this.column.type)) {
      return `hyper-table/cell-renderers/${this.column.type}`;
    }
  }),

  _renderingComponent: or(
    'column.renderingComponent', '_typeInferredRenderingComponent'
  ),

  _filtersRenderingComponent: computed('column.type', function() {
    if (AVAILABLE_RENDERERS.includes(this.column.type)) {
      return `hyper-table/filters-renderers/${this.column.type}`;
    }
  }),

  _filtersChanged: observer('column.filters.@each', function () {
    this.set('_filtered', !isEmpty(this.column.filters));
  }),

  _tableStateListener() {
    this.set('_ordered', !isEmpty(this.column.orderBy));
    this.set('_filtered', !isEmpty(this.column.filters));
  },

  _filtersPanelListener() {
    if (this.column.property !== this.manager.applyingFiltersOn) {
      this.set('showFiltersPanel', false);
    }
  },

  didReceiveAttrs() {
    if (this.column) {
      AVAILABLE_RENDERERS.forEach((rendererType) => {
        defineProperty(
          this,
          `is${capitalize(rendererType)}`,
          computed('column.type', function() {
            return this.column.type === rendererType;
          })
        );
      });

      if (this.header) {
        this.addObserver(
          'manager.columns.@each.orderBy',
          this,
          this._tableStateListener
        );

        this.addObserver(
          'manager.applyingFiltersOn',
          this,
          this._filtersPanelListener
        );
      }

      this.set('_ordered', !isEmpty(this.column.orderBy));
      this.set('_filtered', !isEmpty(this.column.filters));
    }
  },

  click(e) {
    if (!this.header && this.onRowClicked) {
      this.onRowClicked(this.item);
    }
  },

  actions: {
    toggleFiltersPanel() {
      this.toggleProperty('showFiltersPanel');
      this.set('manager.applyingFiltersOn', this.column.property);
    },
    orderColumn() {
      let nextDirection = this.column.orderDirection === 'asc' ? 'desc' : 'asc';
      this.manager.updateOrdering(this.column, `${this.column.orderType}:${nextDirection}`);
    }
  }
});
