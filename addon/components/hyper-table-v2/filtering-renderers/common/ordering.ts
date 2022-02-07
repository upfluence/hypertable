import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
  @tracked _selectedDirection: OrderDirection | undefined;

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersOrderingArgs) {
    super(owner, args);

    args.handler.on('reset-columns', (columns) => {
      if (columns.includes(args.column)) {
        this._selectedDirection = undefined;
      }
    });
  }

  get orderingOptions() {
    return this.args?.orderingOptions || defaultOrderingDirections;
  }

  get currentOrderingDirection(): OrderDirection | undefined {
    return this._selectedDirection || this.args.column.order?.direction;
  }

  @action
  orderingDirectionChanged(direction: OrderDirection): void {
    this.args.handler.applyOrder(this.args.column, direction).then(() => {
      this._selectedDirection = direction;
    });
  }
}
