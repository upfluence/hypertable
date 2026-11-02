import { action } from '@ember/object';
import { isBlank } from '@ember/utils';

import NumericFilterRenderer from '@upfluence/hypertable/components/hyper-table/filters-renderers/numeric';

export default NumericFilterRenderer.extend({
  _addRangeFilter() {
    let filters = [];

    if (!isBlank(this.lowerBoundFilter)) {
      filters.push({ key: 'lower_bound', value: (this.lowerBoundFilter * 100).toString() });
    }
    if (!isBlank(this.upperBoundFilter)) {
      filters.push({ key: 'upper_bound', value: (this.upperBoundFilter * 100).toString() });
    }
    this.column.set('filters', filters);
    this.manager.hooks.onColumnsChange('columns:change');
  },

  didReceiveAttrs() {
    this._super();
    if (this.column) {
      let lowerBound = this.column.filters.find((filter) => filter.key === 'lower_bound');
      let upperBound = this.column.filters.find((filter) => filter.key === 'upper_bound');

      if (!isBlank(lowerBound)) {
        this.setProperties({ lowerBoundFilter: lowerBound.value / 100 });
      }
      if (!isBlank(upperBound)) {
        this.setProperties({ upperBoundFilter: upperBound.value / 100 });
      }
    }
  },

  orderingOptionChanged: action(function (value) {
    this.manager.updateOrdering(this.column, value);
  }),

  _resetFilters() {
    this._super();
    this.manager.updateOrdering(this.column, null);
    this.setProperties({ lowerBoundFilter: null, upperBoundFilter: null });
  }
});
