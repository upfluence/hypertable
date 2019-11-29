import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';

import FiltersRendererMixin from '@upfluence/hypertable/mixins/filters-renderer';

export default Component.extend(FiltersRendererMixin, {
  _searchQuery: computed('column', 'column.filters', function() {
    let searchTerm = this.column.filters.findBy('key', 'value');

    return searchTerm ? searchTerm.value : null;
  }),

  orderingOptions: computed('column.orderKey', function() {
    return {
      'A — Z': `${this.column.orderKey}:asc`,
      'Z — A': `${this.column.orderKey}:desc`
    }
  }),

  _addSearchFilter() {
    if(this._searchQuery !== null) {
      this.column.set(
        'filters',
        isEmpty(this._searchQuery) ? [] : [{ key: 'value', value: this._searchQuery }]
      );
      this.manager.hooks.onColumnsChange('columns:change');
    }
  },

  _searchQueryObserver: observer('_searchQuery', function() {
    run.debounce(this, this._addSearchFilter, 1000);
  }),

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    },

    reset() {
      this._super();
      this.manager.updateOrdering(this.column, null);
      this.set('_searchQuery', null)
    }
  }
});
