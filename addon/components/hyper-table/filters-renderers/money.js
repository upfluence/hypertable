import Component from '@ember/component';

export default Component.extend({
  classNames: ['available-filters'],

  orderingOptions: {
    '0 — 9': 'alphanumerical:asc',
    '9 — 0': 'alphanumerical:desc'
  },

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    }
  }
});
