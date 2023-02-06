import { A } from '@ember/array';
import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { alias, filterBy } from '@ember/object/computed';
import { run, once } from '@ember/runloop';
import { compare, isEmpty, typeOf } from '@ember/utils';
import $ from 'jquery';

export default Component.extend({
  classNames: ['hypertable-container'],

  searchComponent: null,
  contextualActions: null,
  footer: null,
  bottomReachedOffset: 0,
  meta: {},

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

  _selectAllChecked: false,

  _searchQuery: computed('_columns.firstObject.filters.{[],@each.value}', {
    get: function () {
      if (isEmpty(this._columns)) return;

      let searchTerm = this._columns.firstObject.filters.findBy('key', 'value');

      return searchTerm ? searchTerm.value : null;
    },
    set: function (k, v) {
      this._columns.firstObject.set('filters', isEmpty(v) ? [] : [{ key: 'value', value: v }]);
      run.debounce(this, this._doSearch, 1000);
      return v;
    }
  }),

  _doSearch: function () {
    if (this.manager.hooks.onSearchQueryChange && this._searchQuery !== null) {
      this.manager.hooks.onSearchQueryChange(this._searchQuery);
    }
  },

  _loadingCollection: new Array(20),
  _collection: alias('manager.data'),
  _columns: alias('manager.columns'),
  _fieldCategories: computed('manager.fieldCategories', function () {
    return this.manager.fieldCategories.sortBy('label');
  }),

  _selectedItems: filterBy('_collection', 'selected', true),
  _excludedItems: [],
  _selectedCount: computed(
    'selectAllIncludesHidden',
    '_allRowsSelected',
    '_selectedItems.length',
    '_excludedItems.length',
    'meta.total',
    function () {
      if (this._allRowsSelected) {
        return this.meta.total - this._excludedItems.length;
      }

      return this._selectedItems.length;
    }
  ),

  _hoveredItems: filterBy('_collection', 'hovered', true),

  _footerType: computed('footer', function () {
    return typeOf(this.footer);
  }),

  _searchComponentType: computed('searchComponent', function () {
    return typeOf(this.searchComponent);
  }),

  _orderedFilteredClusters: computed('manager.fields', '_availableFieldsKeyword', '_activeFieldCategory', function () {
    let _keyword = this._availableFieldsKeyword.toLowerCase();

    let fields = A(
      this.manager.fields.filter((x) => {
        const hasKeyword = !this._availableFieldsKeyword || x.name.toLowerCase().indexOf(_keyword) >= 0;
        const hasActiveGroup = !this._activeFieldCategory || x.categories.indexOf(this._activeFieldCategory) >= 0;
        const isToggleable = x.toggleable === true;

        return hasKeyword && hasActiveGroup && isToggleable;
      })
    );

    fields.sortBy('name');
    return this.groupByClusteringKey(fields);
  }),

  _loadingMore: computed.and('manager.hooks.onBottomReached', 'loadingMore'),

  _setAllRowSelected(value) {
    this.set('_allRowsSelected', value);
    this.manager.set('_allRowsSelected', this._allRowsSelected);
  },

  _allRowSelectedManager(value) {
    this._setAllRowSelected(value);

    this.get('_collection').setEach('selected', value);

    this.set('_excludedItems', []);
    this.manager.set('excludedItems', this._excludedItems);
  },

  _selectedItemsChanged: observer('_selectedItems', function () {
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

  _resizeInnerTable() {
    this.set('_innerTableHeight', window.innerHeight - this._innerTable.offsetTop - 10);

    if (this.footer) {
      this.set('_innerTableHeight', this._innerTableHeight - (20 + 80)); // Footer Height + Margin
    }

    this._innerTable.setAttribute('style', `height: ${this._innerTableHeight}px !important;`);
  },

  groupByClusteringKey(fields) {
    const map = new Map();

    fields.forEach((field) => {
      const cluster = map.get(field.clustering_key);

      if (!cluster) {
        map.set(field.clustering_key, [field]);
      } else {
        cluster.push(field);
      }
    });

    return map;
  },

  init() {
    this._super();

    $(window).on('resize', this._resizeInnerTable.bind(this));

    // eslint-disable-next-line ember/no-incorrect-calls-with-inline-anonymous-functions
    run.scheduleOnce('afterRender', this, () => {
      let table = document.querySelector('.hypertable');
      $(table).scroll(() => {
        if (table.scrollLeft === table.scrollWidth - table.clientWidth) {
          this.manager.set('isScrollable', false);
        } else if (!this.manager.isScrollable) {
          this.manager.set('isScrollable', true);
        }
      });
      this.manager.refreshScrollableStatus();
    });
  },

  didRender() {
    this._super();

    // eslint-disable-next-line ember/no-incorrect-calls-with-inline-anonymous-functions
    once(() => {
      this.set('_innerTable', document.querySelector('.hypertable__table'));
      this._resizeInnerTable();
    });
  },

  willDestroyElement() {
    $(window).off('resize');
  },

  actions: {
    reorderColumns(itemModels) {
      let _cs = [this._columns[0]].concat(itemModels);
      let hasSameOrder = compare(_cs.mapBy('key'), this.manager.columns.mapBy('key')) === 0;

      if (!hasSameOrder) {
        this.manager.updateColumns(_cs);

        if (this.manager.hooks.onColumnsChange) {
          this.manager.hooks.onColumnsChange('columns:reorder');
        }
      }
    },

    openAvailableFields() {
      if (this.manager.tetherOn) {
        this.manager.destroyTetherInstance();
      }
      this.manager.toggleProperty('availableFieldsPanel');
      this.manager.set('availableTableViews', false);
    },

    closeAvailableFields() {
      this.manager.set('availableFieldsPanel', false);
    },

    openAvailableViews() {
      if (this.manager.tetherOn) {
        this.manager.destroyTetherInstance();
      }
      this.manager.toggleProperty('availableTableViews');
      this.manager.set('availableFieldsPanel', false);
    },

    closeAvailableViews() {
      this.manager.set('availableTableViews', false);
    },

    scrollToEnd() {
      this._innerTable.firstElementChild.scrollLeft = this._innerTable.firstElementChild.scrollWidth;
    },

    toggleHover(item, value) {
      item.set('hovered', value);
    },

    setFieldCategory(category) {
      this.set('_activeFieldCategory', category);
    },

    updateFieldVisibility(field) {
      field.set('visible', !field.visible);
    },

    fieldVisibilityUpdated(field) {
      if (this.manager.updatingTableView) {
        return;
      }

      this.manager.toggleColumnVisibility(field).then((action) => {
        if (this.manager.hooks.onColumnsChange) {
          this.manager.hooks.onColumnsChange('columns:change', { visibilityChanged: true });
        }

        if (action === 'addition') {
          this._innerTable.firstElementChild.scrollLeft = this._innerTable.firstElementChild.scrollWidth;
        }
        this.manager.refreshScrollableStatus();
      });
    },

    onBackdropClick() {
      this.manager.destroyTetherInstance();
    },

    dragStarted() {
      if (this.manager.tetherOn) {
        this.manager.destroyTetherInstance();
      }
    },

    resetAllFilters() {
      this._columns.setEach('filters', []);

      if (this.manager.hooks.onColumnsChange) {
        this.manager.hooks.onColumnsChange('columns:change');
      }
    },

    selectAllGlobal() {
      this._allRowSelectedManager(true);
      this.set('_selectAllChecked', true);
    },

    clearSelection() {
      this._allRowSelectedManager(false);
      this.set('_selectAllChecked', false);
    },

    toggleSelectAll(value) {
      this.set('_selectAllChecked', value);
      if (this._selectAllChecked) {
        if (this._selectedCount === this.meta.total) {
          this._allRowSelectedManager(true);
        } else {
          this.get('_collection').setEach('selected', true);
        }
      } else {
        this.send('clearSelection');
      }
    },

    toggleItem(item, value) {
      item.set('selected', value);
      this.set('_selectAllChecked', this._selectedCount > 0);

      if (this._allRowsSelected) {
        if (this._excludedItems.includes(item)) {
          this.set(
            '_excludedItems',
            this._excludedItems.filter((_excludedItem) => _excludedItem !== item)
          );
        } else {
          this.set('_excludedItems', [...this._excludedItems, item]);
        }
        this.manager.set('excludedItems', this._excludedItems);
      }

      if (this._selectedCount === this.meta.total) {
        this._setAllRowSelected(true);
      }
    }
  }
});
