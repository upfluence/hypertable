import { A } from '@ember/array';
import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { alias, filterBy } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  classNames: ['hypertable-container'],

  collection: [],
  contextualActions: null,
  loadingMore: false,

  /*
   * Configuration
   * =============
   *
   * Define which features of the datatable should be activated.
   *
   */
  options: {
    features: {
      selection: false,
      search: false
    }
  },

  /*
   * Event Hooks
   * ===========
   *
   * Actions to be called to react to various events happening on the datatable
   *
   */
  hooks: {
    onColumnsChange: null,
    onBottomReached: null,
    onSearchQueryChange: null,
  },

  _allRowsSelected: false,
  _hasScrollbar: false,

  _availableColumnsPanel: false,
  _availableColumnsKeyword: '',

  _searchQuery: null,

  _columns: alias('manager.columns'),
  _selectedItems: filterBy('collection', 'selected', true),

  _orderedFilteredColumns: computed(
    '_columns',
    '_availableColumnsKeyword',
    function() {
      let columns = A(this._columns);

      if (!isEmpty(this._availableColumnsKeyword)) {
        let reg = RegExp(this._availableColumnsKeyword, 'i');
        columns = A(columns.filter((x) => reg.test(x.title)));
      }

      return columns.sortBy('title');
    }
  ),

  _loadingMore: computed('_hasScrollbar', 'loadingMore', function() {
    return this.onBottomReached && this._hasScrollbar && this.loadingMore;
  }),

  _selectAllObserver: observer('_allRowsSelected', function() {
    this.get('collection').forEach((item) => {
      if (this.get('_allRowsSelected')) {
        item.set('selected', true);
      } else {
        item.set('selected', false);
      }
    });
  }),

  _columnsChanged: observer(
    '_columns', '_columns.@each.{visible,sortBy,filters}',
    function() {
      if (this.hooks.onColumnsChange) {
        this.hooks.onColumnsChange(this._columns);
      }
    }
  ),

  _selectedItemsChanged: observer('_selectedItems', function() {
    if (this.contextualActions) {
      let ca = document.querySelector('.contextual-actions');

      if (this._selectedItems.length > 0) {
        ca.classList.remove('contextual-actions--no-animation');
        ca.classList.add('contextual-actions--visible');
      } else {
        ca.classList.remove('contextual-actions--visible');
        ca.classList.add('contextual-actions--hidden');
      }
    }
  }),

  _searchQueryObserver: observer('_searchQuery', function() {
    run.debounce(this, () => {
      if (this.hooks.onSearchQueryChange) {
        this.hooks.onSearchQueryChange(this.get('_searchQuery'));
      }
    }, 1000);
  }),

  didInsertElement() {
    let self = this;

    this.$('.hypertable__table').on('scroll', function() {
      let tableHeight = $(this).innerHeight();
      let contentHeight = $('.hypertable')[0].scrollHeight;
      let heightScrolled = $(this).scrollTop();

      self.set('_hasScrollbar', (tableHeight <= contentHeight));

      if ((heightScrolled + tableHeight) >= contentHeight) {
        if (self.hooks.onBottomReached) {
          self.hooks.onBottomReached();
        }
      }
    });
  },

  actions: {
    reorderColumns(x, itemModels, _) {
      let _cs = [x[0]].concat(itemModels.concat(x.filter(x => !x.visible)))
      _cs.forEach((c, i) => c.set('order', i))
      this.manager.updateColumns(_cs);
    },

    openAvailableColumns() {
      this.toggleProperty('_availableColumnsPanel');
    }
  }
});
