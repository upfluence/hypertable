import Component from '@ember/component';
import { computed } from '@ember/object';

import moment from 'moment';

export default Component.extend({
  classNames: ['available-filters'],

  orderingOptions: computed('column.orderKey', function() {
    return {
      'Oldest — Newest': this.column.orderKey + ':asc',
      'Newest — Oldest': this.column.orderKey + ':desc'
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

  _currentDateValue: computed(
    'column.filters.@each.value.alias',
    function() {
    let filter = this.column.filters.find((f) => f.type === 'range');

    if (!filter) return null;

    if (filter.value.alias === 'custom_range') {
      return [
        moment.unix(filter.value.from).toDate(),
        moment.unix(filter.value.to).toDate()
      ];
    } else {
      return filter.value.alias;
    }
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
      if(fromDate && toDate)
        this.column.addFilters(
          'range', this._buildDateRange('custom_range', fromDate, toDate)
        );
    },

    // Mixin Candidate
    clearFilters() {
      this.column.clearFilters();
      this.flatpickrRef.clear();
    }
  }
});
