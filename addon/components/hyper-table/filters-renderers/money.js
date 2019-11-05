import Component from '@ember/component';

export default Component.extend({
  classNames: ['available-filters'],

  orderingOptions: computed('column.orderKey', function() {
    return {
      '0 — 9': this.column.orderKey + ':asc',
      '9 — 0': this.column.orderKey + ':desc'
    }
  }),

  actions: {
    orderingOptionChanged(value) {
      this.manager.updateOrdering(this.column, value);
    }
  }
});
