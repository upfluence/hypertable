import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';

export default Mixin.create({
  classNames: ['available-filters'],

  _controlNamePrefix: computed('column.key', function() {
    return `table_column_filter_sort_${this.column.key}`;
  }),

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
