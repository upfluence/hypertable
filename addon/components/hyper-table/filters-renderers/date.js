import Component from '@ember/component';
import { computed } from '@ember/object';

import moment from 'moment';

export default Component.extend({
  classNames: ['available-filters'],

  fromDate: null,
  toDate: null,

  orderingOptions: {
    'Oldest — Newest': 'alphanumerical:asc',
    'Newest — Oldest': 'alphanumerical:desc'
  },

  filteringOptions: {
    'Fixed': 'fixed',
    'Moving': 'moving'
  },

  filterOption: 'moving', // or 'moving'

  currentMovingDateOption: computed('column.filters.@each.value.alias', function() {
    let filter = this.column.filters.find((f) => f.type === 'range');

    return (filter) ? filter.value.alias : null;
  }),

  movingDateOptions: {
    'Today': 'today',
    'Yesterday': 'yesterday',
    'This Week': 'this_week',
    'Last Week': 'last_week',
    'This Month': 'this_month',
    'This Year': 'this_year',
  },

  _buildDateRange(from) {
    switch(from) {
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
          from: +this.fromDate,
          to: +this.toDate
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
      this.setProperties({fromDate: value[0], toDate: value[1]});

      if(this.fromDate && this.toDate)
        this.column.addFilters(
          'range', this._buildDateRange('custom_range')
        );
    },

    // Mixin Candidate
    clearFilters() {
      this.column.clearFilters();
      this.flatpickrRef.clear();
    }
  }
});
