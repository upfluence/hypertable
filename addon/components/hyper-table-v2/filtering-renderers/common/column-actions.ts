import Component from '@glimmer/component';
import { action, computed } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2FilteringRenderersCommonColumnActionsArgs {
  handler: TableHandler;
  column: Column;
}

export default class HyperTableV2FilteringRenderersCommonColumnActions extends Component<HyperTableV2FilteringRenderersCommonColumnActionsArgs> {
  get shouldDisplay(): boolean {
    return !this.args.column.definition.position?.sticky;
  }

  @computed('args.column.filters.[]', 'args.column.order')
  get displayClearButton(): boolean {
    return (this.args.column.filters?.length ?? 0) > 0 || this.args.column.order !== undefined;
  }

  @action
  reset(): void {
    this.args.handler.resetColumns([this.args.column]);
  }

  @action
  removeColumn(): void {
    this.args.handler.destroyTetherInstance();
    this.args.handler.removeColumn(this.args.column.definition);
  }
}
