import Component from '@ember/component';

export default Component.extend({
  classNames: ['available-filters'],

  orderingOptions: {
    'A — Z': 'alphanumerical:asc',
    'Z — A': 'alphanumerical:desc'
  },

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    }
  }
});
