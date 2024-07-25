import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { debounce } from '@ember/runloop';

import FiltersRendererMixin from '@upfluence/hypertable/mixins/filters-renderer';

export default Component.extend(FiltersRendererMixin, {
  lowerBoundFilter: null,
  upperBoundFilter: null,

  existenceFilters: {
    'With Value': 'with',
    'Without Value': 'without'
  },

  orderingOptions: computed('column.orderKey', function () {
    return {
      '0 — 9': `${this.column.orderKey}:asc`,
      '9 — 0': `${this.column.orderKey}:desc`
    };
  }),

  currentExistenceFilter: computed('column.filters.[]', 'lowerBoundFilter', 'upperBoundFilter', function () {
    let _existenceFilter = this.column.filters.findBy('key', 'existence');

    if (_existenceFilter) {
      return _existenceFilter.value;
    }

    return this.lowerBoundFilter || this.upperBoundFilter ? 'with' : null;
  }),

  _: observer('lowerBoundFilter', 'upperBoundFilter', function () {
    if (this.lowerBoundFilter || this.upperBoundFilter) {
      debounce(this, this._addRangeFilter, 1000);
    }
  }),

  _addRangeFilter() {
    this.column.set('filters', [
      ...(this.lowerBoundFilter ? [{ key: 'lower_bound', value: this.lowerBoundFilter }] : []),
      ...(this.upperBoundFilter ? [{ key: 'upper_bound', value: this.upperBoundFilter }] : [])
    ]);
    this.manager.hooks.onColumnsChange('columns:change');
  },

  didReceiveAttrs() {
    this._super();
    if (this.column) {
      let lowerBound = this.column.filters.findBy('key', 'lower_bound');
      let upperBound = this.column.filters.findBy('key', 'upper_bound');

      this.setProperties({
        lowerBoundFilter: lowerBound?.value,
        upperBoundFilter: upperBound?.value
      });
    }
  },

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    },

    existenceFilterChanged(value) {
      this.set('currentExistenceFilter', value);

      this.column.set('filters', [{ key: 'existence', value }]);
      this.manager.hooks.onColumnsChange('columns:change');
    },

    reset() {
      this._super();
      this.manager.updateOrdering(this.column, null);
      this.setProperties({ lowerBoundFilter: null, upperBoundFilter: null });
    }
  }
});
