import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Component.extend({
  classNames: ['available-filters'],

  _searchQuery: computed('column', 'column.filters', function() {
    let searchTerm = this.column.filters.find((x)=> x.value.term);

    return searchTerm ? searchTerm.value.term : null;
  }),

  orderingOptions: {
    'A — Z': 'alphanumerical:asc',
    'Z — A': 'alphanumerical:desc'
  },

  _addSearchFilter() {
    this.column.addFilters(
      'search', {
        alias: 'search',
        term: this._searchQuery,
      }
    );
  },

  _searchQueryObserver: observer('_searchQuery', function() {
    run.debounce(this, this._addSearchFilter, 1000);
  }),

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    }
  }
});
