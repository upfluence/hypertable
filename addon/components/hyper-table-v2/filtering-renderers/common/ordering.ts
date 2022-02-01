import { action } from '@ember/object';
import Component from '@glimmer/component';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, OrderDirection } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2FilteringRenderersOrderingArgs {
  handler: TableHandler;
  column: Column;
  orderingOptions: { [key: string]: OrderDirection };
}

const defaultOrderingDirections: { [key: string]: OrderDirection } = {
  'A — Z': 'asc',
  'Z — A': 'desc'
};

export default class HyperTableV2FilteringRenderersOrdering extends Component<HyperTableV2FilteringRenderersOrderingArgs> {
  get orderingOptions() {
    return this.args?.orderingOptions || defaultOrderingDirections;
  }

  get currentOrderingDirection(): OrderDirection | undefined {
    return this.args.column.order?.direction;
  }

  @action
  orderingDirectionChanged(direction: OrderDirection): void {
    this.args.handler.applyOrder(this.args.column, direction);
  }
}
