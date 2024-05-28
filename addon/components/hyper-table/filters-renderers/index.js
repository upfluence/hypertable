import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FiltersRenderer extends Component {
  get _controlNamePrefix() {
    return `table_column_filter_sort_${this.args.column.key}`;
  }

  @action
  reset() {
    this.args.column.reset();
    this.args.manager.updateOrdering(this.args.column, null);
  }

  @action
  removeColumn() {
    if (this.args.manager.tetherInstance) {
      this.args.manager.destroyTetherInstance();
    }

    this.args.manager.toggleColumnVisibility(this.args.column.field, this.args.column).then(() => {
      if (this.args.manager.hooks.onColumnsChange) {
        this.args.manager.hooks.onColumnsChange('columns:change', { visibilityChanged: true });
      }
    });
  }
}
