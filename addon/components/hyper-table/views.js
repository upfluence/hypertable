import Component from '@ember/component';

export default Component.extend({
  isHiddenAddViewModal: true,
  isHiddenUpdateViewModal: true,
  newViewName: '',
  selectedView: null,

  actions: {
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
