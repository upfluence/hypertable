import NumericFilterRenderer from '@upfluence/hypertable/components/hyper-table/filters-renderers/numeric';

export default NumericFilterRenderer.extend({
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
        });
      }
    }
  },

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    },

    reset() {
      this._super();
      this.manager.updateOrdering(this.column, null);
      this.setProperties({ lowerBoundFilter: null, upperBoundFilter: null });
    }
  }
});
