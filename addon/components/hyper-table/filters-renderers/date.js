import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';

import FiltersRendererMixin from '@upfluence/hypertable/mixins/filters-renderer';

export default Component.extend(FiltersRendererMixin, {
  orderingOptions: computed('column.orderKey', function () {
    return {
      'Oldest — Newest': `${this.column.orderKey}:asc`,
      'Newest — Oldest': `${this.column.orderKey}:desc`
    };
  }),

  filteringOptions: {
    Moving: 'moving',
    Fixed: 'fixed'
  },

  filterOption: computed('currentMovingDateOption', function () {
    if (!this.currentMovingDateOption) {
      return 'fixed';
    }

    return 'moving';
  }),

  currentMovingDateOption: computed('column.filters', function () {
    let filter = this.column.filters.find((f) => f.key === 'value');
    return filter ? filter.value : null;
  }),

  _currentDateValue: computed('column.filters', function () {
    let lowerBound = this.column.filters.findBy('key', 'lower_bound');
    let upperBound = this.column.filters.findBy('key', 'upper_bound');

    if (lowerBound && upperBound) {
      return [moment.unix(lowerBound.value).toDate(), moment.unix(upperBound.value).toDate()];
    }

    return [];
  }),

  movingDateOptions: {
    Today: 'today',
    Yesterday: 'yesterday',
    'This Week': 'this_week',
    'Last Week': 'last_week',
    'This Month': 'this_month',
    'This Year': 'this_year'
  },

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    },

    filterOptionChanged(value) {
      this.set('filterOption', value);
    },

    selectMovingDate(value) {
      this.set('column.filters', [
        {
          key: 'value',
          value: value
        }
      ]);
      this.set('currentMovingDateOption', value);
      this.manager.hooks.onColumnsChange('columns:change');
    },

    selectFixedDate(value) {
      let [fromDate, toDate] = value;

      if (fromDate && toDate) {
        this.column.set('filters', [
          { key: 'lower_bound', value: (+fromDate / 1000).toString() },
          { key: 'upper_bound', value: (+toDate / 1000).toString() }
        ]);

        this.manager.hooks.onColumnsChange('columns:change');
      }
    },

    // Mixin Candidate
    reset() {
      this._super();
      this.manager.updateOrdering(this.column, null);

      if (this.flatpickrRef) {
        this.flatpickrRef.clear();
      }
    }
  }
});
