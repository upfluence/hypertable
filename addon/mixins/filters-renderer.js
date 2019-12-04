import Mixin from '@ember/object/mixin';

export default Mixin.create({
  classNames: ['available-filters'],

  actions: {
    reset() {
      this.column.reset();
    },
    removeColumn() {
      if (this.manager.tetherInstance) {
        this.manager.destroyTetherInstance();
      }
      this.column.field.set('visible', false);
    }
  }
});
