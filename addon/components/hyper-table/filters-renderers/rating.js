import Component from '@ember/component';
import { computed } from '@ember/object';

import FiltersRendererMixin from '@upfluence/hypertable/mixins/filters-renderer';

export default Component.extend(FiltersRendererMixin, {
  existenceFilters: {
    'With Value': 'with',
    'Without Value': 'without'
  },

  orderingOptions: computed('column.orderKey', function() {
    return {
      '0 — 5': `${this.column.orderKey}:asc`,
      '5 — 0': `${this.column.orderKey}:desc`
    }
  }),

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
    }
  }
});
