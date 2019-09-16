import Component from '@ember/component';
import { computed, defineProperty, observer } from '@ember/object';
import { or } from '@ember/object/computed';
import { capitalize } from '@ember/string';
import { isEmpty } from '@ember/utils';

const AVAILABLE_RENDERERS = [
  'text', 'numeric', 'money', 'date'
];

export default Component.extend({
  classNames: ['hypertable__cell'],
  classNameBindings: [
    'header:hypertable__cell--header',
    'item.selected:hypertable__cell--selected',
    'loading:hypertable__cell--loading',
    '_sorted:hypertable__cell--sorted',
    '_filtered:hypertable__cell--filtered',
    'isNumeric:hypertable__cell--numeric',
    'isMoney:hypertable__cell--numeric',
    'onRowClicked:hypertable__cell--clickable'
  ],

  header: false,
  selection: false,
  loading: false,

  _sorted: false,
  _filtered: false,
  _showFiltersPanel: false,

  _sortingIconClass: computed('_sorted', function() {
    if (this._sorted) {
      let [_, direction] = this.column.sortBy.split(':');

      return (direction === 'asc') ? 'fa-long-arrow-up' : 'fa-long-arrow-down';
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
    this.set('_sorted', !isEmpty(this.column.sortBy));
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
          'manager.columns.@each.sortBy',
          this,
          this._tableStateListener
        );

        this.addObserver(
          'manager.applyingFiltersOn',
          this,
          this._filtersPanelListener
        );
      }

      this.set('_sorted', !isEmpty(this.column.sortBy));
      this.set('_filtered', !isEmpty(this.column.filters));
    }
  },

  click(e) {
    if (this.onRowClicked) {
      this.onRowClicked(this.item);
    }
  },

  actions: {
    toggleFiltersPanel() {
      this.toggleProperty('showFiltersPanel');
      this.set('manager.applyingFiltersOn', this.column.property);
    }
  }
});
