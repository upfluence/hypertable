import { action, computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  _controlNamePrefix: computed('column.key', function () {
    return `table_column_filter_sort_${this.column.key}`;
  }),

  _resetFilters() {
    this.column.reset();
  },

  reset: action(function () {
    this._resetFilters();
  }),

  removeColumn: action(function () {
    if (this.manager.tetherInstance) {
      this.manager.destroyTetherInstance();
    }

    this.manager.toggleColumnVisibility(this.column.field, this.column).then(() => {
      if (this.manager.hooks.onColumnsChange) {
        this.manager.hooks.onColumnsChange('columns:change', { visibilityChanged: true });
      }
    });
  })
});
