import { A } from '@ember/array';
import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { alias, filterBy } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { isEmpty, typeOf } from '@ember/utils';

export default Component.extend({
  classNames: ['hypertable-container'],

  contextualActions: null,
  footer: null,
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
    onRowClicked: null
  },

  _allRowsSelected: false,
  _hasScrollbar: false,

  _availableColumnsPanel: false,
  _availableColumnsKeyword: '',

  _searchQuery: null,

  _collection: alias('manager.data'),
  _columns: alias('manager.columns'),
  _selectedItems: filterBy('_collection', 'selected', true),

  _footerType: computed('footer', function() {
    return typeOf(this.footer);
  }),

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

  _loadingMore: computed(
    'onBottomReached',
    '_hasScrollbar',
    'loadingMore',
    function() {
      return this.hooks.onBottomReached && this._hasScrollbar && this.loadingMore;
    }
  ),

  _selectAllObserver: observer('_allRowsSelected', function() {
    this.get('_collection').forEach((item) => {
      if (this.get('_allRowsSelected')) {
        item.set('selected', true);
      } else {
        item.set('selected', false);
      }
    });
  }),

  _columnsChanged: observer(
    '_columns', '_columns.@each.{visible,orderBy,filters}',
    function() {
      if (this.hooks.onColumnsChange) {
        this.hooks.onColumnsChange(this._columns);
      }
    }
  ),

  _selectedItemsChanged: observer('_selectedItems', function() {
    if (this.contextualActions) {
      let ca = document.querySelector('.contextual-actions');

      if (ca) {
        if (this._selectedItems.length > 0) {
          ca.classList.remove('contextual-actions--no-animation');
          ca.classList.add('contextual-actions--visible');
        } else {
          ca.classList.remove('contextual-actions--visible');
          ca.classList.add('contextual-actions--hidden');
        }
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

    let _innerTable = this.$('.hypertable__table')[0];
    let _innerTableHeight = $('html').innerHeight() - _innerTable.offsetTop;

    if (this.footer) {
      _innerTableHeight -= 90; // Footer Height + Margin
    }

    _innerTable.setAttribute(
      'style', `height: ${_innerTableHeight}px !important;`
    );

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
