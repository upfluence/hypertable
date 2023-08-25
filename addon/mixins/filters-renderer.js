import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';

export default Mixin.create({
  _controlNamePrefix: computed('column.key', function () {
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

      this.manager.toggleColumnVisibility(this.column.field, this.column).then(() => {
        if (this.manager.hooks.onColumnsChange) {
          this.manager.hooks.onColumnsChange('columns:change', { visibilityChanged: true });
        }
      });
    }
  }
});
