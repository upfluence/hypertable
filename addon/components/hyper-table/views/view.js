import Component from '@ember/component';

export default Component.extend({
  showSharingModal: false,

  actions: {
    toggleSharingModal() {
      this.toggleProperty('showSharingModal');
    }
  }
});
