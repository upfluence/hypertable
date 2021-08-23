import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';

import FiltersRendererMixin from '@upfluence/hypertable/mixins/filters-renderer';

export default Component.extend(FiltersRendererMixin, {
  _searchQuery: null,

  orderingOptions: computed('column.orderKey', function () {
    return {
      'A — Z': `${this.column.orderKey}:asc`,
      'Z — A': `${this.column.orderKey}:desc`
    };
  }),

  existenceFilters: {
    'With Value': 'with',
    'Without Value': 'without'
  },

  currentExistenceFilter: computed('column.filters.[]', '_searchQuery', function () {
    let _existenceFilter = this.column.filters.findBy('key', 'existence');

    if (_existenceFilter) {
      return _existenceFilter.value;
    }

    return this._searchQuery ? 'with' : null;
  }),

  _addSearchFilter() {
    if (this._searchQuery !== null) {
      this.column.set(
        'filters',
        isEmpty(this._searchQuery) ? [] : [{ key: this.searchKey || 'value', value: this._searchQuery }]
      );
      this.manager.hooks.onColumnsChange('columns:change');
    }
  },

  _searchQueryObserver: observer('_searchQuery', function () {
    run.debounce(this, this._addSearchFilter, 1000);
  }),

  init() {
    this._super();

    const searchTerm = this.column.filters.findBy('key', this.searchKey || 'value');
    this.set('_searchQuery', searchTerm?.value);
  },

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
      this.set('_searchQuery', null);
    }
  }
});
