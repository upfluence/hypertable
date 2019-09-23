import Component from '@ember/component';
import { observer,computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Component.extend({
  classNames: ['available-filters'],

  _searchQuery: computed('column', 'column.filters', function() {
    let searchTerm = this.column.filters.find((x)=> x.value.term);

    return searchTerm.value.term;
  }),

  orderingOptions: {
    'A — Z': 'alphanumerical:asc',
    'Z — A': 'alphanumerical:desc'
  },

  _searchQueryObserver: observer('_searchQuery', function() {
    run.debounce(this, () => {
      this.column.addFilters(
        'search', {
          alias: 'search',
          term: this._searchQuery,
        }
      );
    }, 1000);
  }),

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    }
  }
});
