import Mixin from '@ember/object/mixin';

export default Mixin.create({
  actions: {
    clearFilters() {
      this.column.clearFilters();
    }
  }
});
