import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['available-filters'],

  sortingOptions: {
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
    'Yesterday': 'yesterday'
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
      default:
        break;
    }
  },

  actions: {
    sortingOptionChanged(value) {
      this.manager.updateSortBy(this.column, value);
    },

    filterOptionChanged(value) {
      this.set('filterOption', value);
    },

    selectMovingDate(value) {
      this.manager.addFilters(
        this.column, 'range', this._buildDateRange(value)
      );
    },

    // Mixin Candidate
    clearFilters() {
      this.manager.clearFilters(this.column);
    }
  }
});
