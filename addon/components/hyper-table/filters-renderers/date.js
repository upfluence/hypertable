import Component from '@ember/component';
import { computed } from '@ember/object';

import moment from 'moment';

export default Component.extend({
  classNames: ['available-filters'],

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
    'This Week': 'This Week',
    'Last Week': 'Last Week',
    'This Month': 'This Month',
    'This Year': 'This Year',
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
      case 'This Week':
        return {
          alias: 'This Week',
          from: moment().startOf('week').format('X'),
          to: moment().endOf('week').format('X')
        }
      case 'Last Week':
        return {
          alias: 'Last Week',
          from: moment().subtract(1, 'week').startOf('week').format('X'),
          to: moment().subtract(1, 'week').endOf('week').format('X')
        }
      case 'This Month':
        return {
          alias: 'This Month',
          from: moment().startOf('month').format('X'),
          to: moment().endOf('month').format('X')
        }
      case 'This Year':
        return {
          alias: 'This Year',
          from: moment().startOf('year').format('X'),
          to: moment().endOf('year').format('X')
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

    // Mixin Candidate
    clearFilters() {
      this.column.clearFilters();
    }
  }
});
