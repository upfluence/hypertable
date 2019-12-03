import { A } from '@ember/array';
import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { alias, filterBy } from '@ember/object/computed';
import { run, once } from '@ember/runloop';
import { compare, isEmpty, typeOf } from '@ember/utils';

export default Component.extend({
  classNames: ['hypertable-container'],

  contextualActions: null,
  footer: null,
  bottomReachedOffset: 0,

  /*
   * Table States
   * ============
   *
   * Various states in which the datatable can be.
   *
   */
  loadingData: false,
  loadingMore: false,

  _allRowsSelected: false,
  _availableFieldsKeyword: '',
  _activeFieldCategory: null,

  _searchQuery: computed('_columns.firstObject', function() {
    if (isEmpty(this._columns)) return;

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
    'loadingMore',
    function() {
      return this.manager.hooks.onBottomReached && this.loadingMore;
    }
  ),

  _infinityLoaderToggler: observer(
    'loadingData',
    'loadingMore',
    '_collection.length',
    function() {
      run.debounce(this, () => {
        let _loadingSmthn = this.loadingData || this.loadingMore;
        let _hasInfinity = this.manager.hooks.onBottomReached;

        this.set(
          '_displayInfinityLoader',
          _hasInfinity && !_loadingSmthn && this._collection.length > 0
        );
      }, 3000)
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
      if (this.manager.hooks.onSearchQueryChange && this._searchQuery !== null) {
        this.manager.hooks.onSearchQueryChange(this._searchQuery);
      }
    }, 1000);
  }),

  _resizeInnerTable() {
    this.set(
      '_innerTableHeight', window.innerHeight - this._innerTable.offsetTop - 90
    );

    if (this.footer) {
      this.set('_innerTableHeight', this._innerTableHeight - 20); // Footer Height + Margin
    }

    this._innerTable.setAttribute(
      'style', `height: ${this._innerTableHeight}px !important;`
    );
  },

  init() {
    this._super();

    $(window).on('resize', this._resizeInnerTable.bind(this));
  },

  didRender() {
    this._super();
    this.$('[data-toggle="tooltip"]').tooltip();

    once(() => {
      this.set('_innerTable', document.querySelector('.hypertable__table'));
      this._resizeInnerTable();
    })
  },

  willDestroyElement() {
    $(window).off('resize');
  },

  actions: {
    reorderColumns(x, itemModels, _) {
      let _cs = [x[0]].concat(itemModels)
      let hasSameOrder =
        compare(_cs.mapBy('key'), this.manager.columns.mapBy('key')) === 0;

      if(!hasSameOrder) {
        this.manager.updateColumns(_cs);

        if (this.manager.hooks.onColumnsChange) {
          this.manager.hooks.onColumnsChange('columns:reorder');
        }
      }
    },

    openAvailableFields() {
      if(this.manager.tetherOn) {
        this.manager.destroyTetherInstance();
      }
      this.manager.toggleProperty('availableFieldsPanel');
    },

    toggleHover(item, value) {
      item.set('hovered', value);
    },

    setFieldCategory(category) {
      this.set('_activeFieldCategory', category);
    },

    fieldVisibilityUpdated(field) {
      this.manager.toggleColumnVisibility(field).then((action) => {
        if (this.manager.hooks.onColumnsChange) {
          this.manager.hooks.onColumnsChange('columns:change');
        }

        if (action === 'addition') {
          this._innerTable.firstElementChild.scrollLeft = this._innerTable.firstElementChild.scrollWidth;
        }
      });
    },

    onBackdropClick() {
      this.manager.destroyTetherInstance();
    },

    dragStarted() {
      if(this.manager.tetherOn) {
        this.manager.destroyTetherInstance();
      }
    },
  }
});
