import Component from '@glimmer/component';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2FilteringRenderersTextArgs {
  handler: TableHandler;
  column: Column;
}

export default class HyperTableV2FilteringRenderersText extends Component<HyperTableV2FilteringRenderersTextArgs> {
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
