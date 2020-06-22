import Component from '@ember/component';
import { observer } from '@ember/object';
import { run } from '@ember/runloop';

export default Component.extend({
  isHiddenAddViewModal: true,
  isHiddenUpdateViewModal: true,
  newViewName: '',
  selectedView: null,
  filteredViews: null,

  _searchQuery: '',
  

  _searchQueryObserver: observer('_searchQuery', function() {
    run.debounce(this, () => {
      if (this._searchQuery !== null) {
        this.set('filteredViews', this.manager.views.filter((view) => {
          return view.name.toLowerCase().includes(this._searchQuery.toLowerCase());
        }));
        return;
      }

      this.set('filteredViews', null)
    }, 500);
  }),

  actions: {
    addPredefinedView(view) {
      if(this.manager.hooks.onAddView) {
        this.manager.hooks.onAddView(view.name, view.table);
        this.manager.predefinedViews.removeObject(view);
      }
    },

    addView() {
      if(this.manager.hooks.onAddView && this.newViewName.length > 0) {
        this.manager.hooks.onAddView(this.newViewName);
        this.toggleProperty('isHiddenAddViewModal');
      }
    },

    updateView() {
      if(this.manager.hooks.onUpdateView && this.selectedView) {
        this.manager.hooks.onUpdateView(this.selectedView);
        this.toggleProperty('isHiddenUpdateViewModal')
      }
    },

    deleteView(view) {
      if(this.manager.hooks.onDeleteView) {
        this.manager.hooks.onDeleteView(view)
      }
    },

    selectView(view) {
      if(this.manager.hooks.onSelectView) {
        this.set('selectedView', view);
        this.manager.hooks.onSelectView(view)
      }
    },

    toggleAddViewModal() {
      this.set('newViewName', '');
      this.toggleProperty('isHiddenAddViewModal');
    },

    toggleUpdateViewModal(selectedView) {
      this.set('selectedView', selectedView);
      this.toggleProperty('isHiddenUpdateViewModal');
    },
  }
});
