import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { run } from '@ember/runloop';

import FiltersRendererMixin from '@upfluence/hypertable/mixins/filters-renderer';

export default Component.extend(FiltersRendererMixin, {
  lowerBoundFilter: null,
  upperBoundFilter: null,

  orderingOptions: computed('column.orderKey', function() {
    return {
      '0 — 9': `${this.column.orderKey}:asc`,
      '9 — 0': `${this.column.orderKey}:desc`
    }
  }),

  _: observer('lowerBoundFilter', 'upperBoundFilter', function() {
    if (this.lowerBoundFilter && this.upperBoundFilter) {
      run.debounce(this, this._addRangeFilter, 1000);
    }
  }),

  _addRangeFilter() {
    this.column.set('filters', [
      { key: 'lower_bound', value: (this.lowerBoundFilter * 100).toString() },
      { key: 'upper_bound', value: (this.upperBoundFilter * 100).toString() }
    ]);
    this.manager.hooks.onColumnsChange('columns:change');
  },

  didReceiveAttrs() {
    if (this.column) {
      let lowerBound = this.column.filters.findBy('key', 'lower_bound');
      let upperBound = this.column.filters.findBy('key', 'upper_bound');

      if (lowerBound && upperBound) {
        this.setProperties({
          lowerBoundFilter: lowerBound.value / 100,
          upperBoundFilter: upperBound.value / 100
        })
      }
    }
  },

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    },

    clearFilters() {
      this._super();
      this.setProperties({ lowerBoundFilter: null, upperBoundFilter: null });
    }
  }
});
