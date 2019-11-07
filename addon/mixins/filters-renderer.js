import Mixin from '@ember/object/mixin';

export default Mixin.create({
  classNames: ['available-filters'],

  actions: {
    clearFilters() {
      this.column.clearFilters();
    }
  }
});
