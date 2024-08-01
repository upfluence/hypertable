import { action } from '@ember/object';
import { throttle } from '@ember/runloop';
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

const THROTTLE_TIME = 300;

export default class HyperTableV2FilteringRenderersOrdering extends Component<HyperTableV2FilteringRenderersOrderingArgs> {
  @tracked _selectedDirection?: OrderDirection | null;

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersOrderingArgs) {
    super(owner, args);

    args.handler.on('reset-columns', (columns) => {
      if (columns.includes(args.column)) {
        this._selectedDirection = null;
      }
    });
  }

  get toggles(): { label: string; value: OrderDirection }[] {
    return Object.keys(this.orderingOptions).reduce((acc: { label: string; value: OrderDirection }[], v: string) => {
      acc.push({
        label: v,
        value: this.orderingOptions[v] as OrderDirection
      });
      return acc;
    }, []);
  }

  get orderingOptions() {
    return this.args.orderingOptions ?? defaultOrderingDirections;
  }

  get currentOrderingDirection(): OrderDirection | null {
    return this._selectedDirection || this.args.column.order?.direction || null;
  }

  @action
  orderingDirectionChanged(direction: OrderDirection): void {
    throttle(this, this._applyOrdering, direction, THROTTLE_TIME);
  }

  private _applyOrdering(direction: OrderDirection): void {
    this.args.handler.applyOrder(this.args.column, direction).then(() => {
      this._selectedDirection = direction;
    });
  }
}
