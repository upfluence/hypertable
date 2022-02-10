import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, OrderDirection } from '@upfluence/hypertable/core/interfaces';
// @ts-ignore
import { run } from '@ember/runloop';

interface HyperTableV2FilteringRenderersNumericArgs {
  handler: TableHandler;
  column: Column;
}

const RANGE_DEBOUNCE_TIME = 500;

export default class HyperTableV2FilteringRenderersNumeric extends Component<HyperTableV2FilteringRenderersNumericArgs> {
  @tracked lowerBoundFilter = '';
  @tracked upperBoundFilter = '';

  orderingDirections: { [key: string]: OrderDirection } = Object.freeze({
    '0 — 9': 'asc',
    '9 — 0': 'desc'
  });

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersNumericArgs) {
    super(owner, args);
    args.handler.on('reset-columns', (columns) => {
      if (columns.includes(args.column)) {
        this._resetStates();
      }
    });
  }

  get hasBoundFiltersDefined(): boolean {
    return this.lowerBoundFilter || this.upperBoundFilter ? true : false;
  }

  private _addRangeFilter(): void {
    this.args.handler.applyFilters(this.args.column, [
      ...(this.lowerBoundFilter ? [{ key: 'lower_bound', value: this.lowerBoundFilter }] : []),
      ...(this.upperBoundFilter ? [{ key: 'upper_bound', value: this.upperBoundFilter }] : [])
    ]);
  }

  @action
  addRangeFilter(): void {
    // @ts-ignore
    run.debounce(this, this._addRangeFilter, RANGE_DEBOUNCE_TIME);
  }

  @action
  removeColumn(): void {
    this.args.handler.destroyTetherInstance();
    this.args.handler.removeColumn(this.args.column.definition);
  }

  private _resetStates(): void {
    this.lowerBoundFilter = '';
    this.upperBoundFilter = '';
  }
}
