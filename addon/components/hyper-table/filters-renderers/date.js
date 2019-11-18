import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';

import FiltersRendererMixin from '@upfluence/hypertable/mixins/filters-renderer';

export default Component.extend(FiltersRendererMixin, {
  orderingOptions: computed('column.orderKey', function() {
    return {
      'Oldest — Newest': `${this.column.orderKey}:asc`,
      'Newest — Oldest': `${this.column.orderKey}:desc`
    }
  }),

  filteringOptions: {
    'Moving': 'moving',
    'Fixed': 'fixed'
  },

  filterOption: computed('column.filters.@each.value.alias', function() {
    let filter = this.column.filters.find((f) => f.type === 'range');

    if (filter && filter.value.alias === 'custom_range') {
      return 'fixed';
    }

    return 'moving';
  }),

  _currentDateValue: computed('column', function() {
    let lowerBound = this.column.filters.findBy('key', 'lower_bound');
    let upperBound = this.column.filters.findBy('key', 'upper_bound');

    if (lowerBound && upperBound) {
      return [
        moment.unix(lowerBound.value).toDate(),
        moment.unix(upperBound.value).toDate()
      ];
    }

    return null;
  }),

  movingDateOptions: {
    'Today': 'today',
    'Yesterday': 'yesterday',
    'This Week': 'this_week',
    'Last Week': 'last_week',
    'This Month': 'this_month',
    'This Year': 'this_year',
  },

  _buildDateRange(from_key, from_date = null, to_date = null) {
    switch(from_key) {
      case 'today':
        return {
          alias: 'today',
          from: moment().startOf('day').format('X'),
          to: moment().endOf('day').format('X')
        }
      case 'yesterday':
        return {
          alias: 'yesterday',
          from: moment().subtract(1, 'day').startOf('day').format('X'),
          to: moment().subtract(1, 'day').endOf('day').format('X')
        }
      case 'this_week':
        return {
          alias: 'this_week',
          from: moment().startOf('week').format('X'),
          to: moment().endOf('week').format('X')
        }
      case 'last_week':
        return {
          alias: 'last_week',
          from: moment().subtract(1, 'week').startOf('week').format('X'),
          to: moment().subtract(1, 'week').endOf('week').format('X')
        }
      case 'this_month':
        return {
          alias: 'this_month',
          from: moment().startOf('month').format('X'),
          to: moment().endOf('month').format('X')
        }
      case 'this_year':
        return {
          alias: 'this_year',
          from: moment().startOf('year').format('X'),
          to: moment().endOf('year').format('X')
        }
      case 'custom_range':
        //+ is a shortcut to get the timestamp directly from a date object
        return {
          alias: 'custom_range',
          from: +from_date/1000,
          to: +to_date/1000
        }
      default:
        break;
    }
  },

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    },

    filterOptionChanged(value) {
      this.set('filterOption', value);
    },

    selectMovingDate(value) {
      this.column.addFilters(
        'range', this._buildDateRange(value)
      );
    },

    selectFixedDate(value) {
      let [fromDate, toDate] = value;

      if(fromDate && toDate) {
        this.column.set('filters', [
          { key: 'lower_bound', value: (+fromDate/1000).toString() },
          { key: 'upper_bound', value: (+toDate/1000).toString() }
        ]);
      }
      this.manager.hooks.onColumnsChange('columns:change');
    },

    // Mixin Candidate
    clearFilters() {
      this._super();
      this.flatpickrRef.clear();
    }
  }
});
