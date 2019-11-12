import { A } from '@ember/array';
import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { alias, filterBy } from '@ember/object/computed';
import { run, once } from '@ember/runloop';
import { typeOf } from '@ember/utils';

export default Component.extend({
  classNames: ['hypertable-container'],

  contextualActions: null,
  footer: null,

  /*
   * Table States
   * ============
   *
   * Various states in which the datatable can be.
   *
   */
  refreshing: false,
  loadingData: false,
  loadingMore: false,

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
    onRowClicked: null,
    onLiveEdit: null
  },

  _allRowsSelected: false,
  _hasScrollbar: false,

  _availableFieldsPanel: false,
  _availableFieldsKeyword: '',
  _activeFieldCategory: null,

  _searchQuery: computed('_columns.firstObject', function() {
    let searchTerm = this._columns.firstObject.filters.findBy('key', 'value');

    return searchTerm ? searchTerm.value : null;
  }),

  _loadingCollection: new Array(12),
  _collection: alias('manager.data'),
  _columns: alias('manager.columns'),
  _fieldCategories: alias('manager.fieldCategories'),
  _selectedItems: filterBy('_collection', 'selected', true),
  _hoveredItems: filterBy('_collection', 'hovered', true),

  _footerType: computed('footer', function() {
    return typeOf(this.footer);
  }),

  _orderedFilteredFields: computed(
    'manager.fields',
    '_availableFieldsKeyword',
    '_activeFieldCategory',
    function() {
      let fields = A(this.manager.fields.filterBy('toggleable', true));
      let _keyword = this._availableFieldsKeyword.toLowerCase()

      fields = A(fields.filter((x) => {
        const hasKeyword = !this._availableFieldsKeyword || x.name.toLowerCase().indexOf(_keyword) >= 0;
        const hasActiveGroup = !this._activeFieldCategory || x.categories.indexOf(this._activeFieldCategory) >= 0;

        return hasKeyword && hasActiveGroup;
      }));

      return fields.sortBy('name');
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

  _triggerColumnChangeHook() {
    this.hooks.onColumnsChange('columns:change');
  },

  _columnsChanged: observer('_columns.@each.{orderBy,filters.[]}', function() {
    if (this.hooks.onColumnsChange) {
      once(this, this._triggerColumnChangeHook);
    }
  }),

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

  _resizeInnerTable() {
    let self = this;

    let _innerTable = this.$('.hypertable__table')[0];
    let _innerTableHeight = window.innerHeight - _innerTable.offsetTop - 90;

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

  didInsertElement() {
    let obs = new MutationObserver((mutations, observer) => {
      for(var i=0; i < mutations.length; ++i) {
        for (var j=0; j<mutations[i].addedNodes.length; ++j) {
          let node = mutations[i].addedNodes[j];

          if(node.classList && node.classList.contains('hypertable__table')) {
            this._resizeInnerTable();
          }
        }
      }
    });

    obs.observe(document.getElementById(this.elementId), { childList: true });
  },

  didRender() {
    this._super();
    this.$('[data-toggle="tooltip"]').tooltip();
  },

  actions: {
    reorderColumns(x, itemModels, _) {
      let _cs = [x[0]].concat(itemModels)

      this.manager.updateColumns(_cs);

      if (this.hooks.onColumnsChange) {
        this.hooks.onColumnsChange('columns:reorder');
      }
    },

    openAvailableFields() {
      this.toggleProperty('_availableFieldsPanel');
    },

    toggleHover(item, value) {
      item.set('hovered', value);
    },

    setFieldCategory(category) {
      this.set('_activeFieldCategory', category);
    },

    fieldVisibilityUpdated(field) {
      this.manager.toggleColumnVisibility(field).then(() => {
        if (this.hooks.onColumnsChange) {
          this.hooks.onColumnsChange('columns:change');
        }
      });
    }
  }
});
