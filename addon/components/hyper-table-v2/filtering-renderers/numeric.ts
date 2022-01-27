import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, OrderDirection } from '@upfluence/hypertable/core/interfaces';
import { run } from '@ember/runloop';

interface HyperTableV2FilteringRenderersNumericArgs {
  handler: TableHandler;
  column: Column;
}

export default class HyperTableV2FilteringRenderersNumeric extends Component<HyperTableV2FilteringRenderersNumericArgs> {
  @tracked lowerBoundFilter = '';
  @tracked upperBoundFilter = '';

  orderingDirections: { [key: string]: OrderDirection } = Object.freeze({
    '0 — 9': 'asc',
    '9 — 0': 'desc'
  });

  existenceFilters = {
    'With Value': 'with',
    'Without Value': 'without'
  };

  get currentOrderingDirection(): OrderDirection | undefined {
    return this.args.column.order?.direction;
  }

  get currentExistenceFilter(): string | null {
    const _existenceFilter = this.args.column.filters.find((filter) => filter.key === 'existence');

    if (_existenceFilter) {
      return _existenceFilter.value;
    }

    return this.lowerBoundFilter || this.upperBoundFilter ? 'with' : null;
  }

  private _addRangeFilter(): void {
    this.args.handler.applyFilters(this.args.column, [
      ...(this.lowerBoundFilter ? [{ key: 'lower_bound', value: this.lowerBoundFilter }] : []),
      ...(this.upperBoundFilter ? [{ key: 'upper_bound', value: this.upperBoundFilter }] : [])
    ]);
  }

  @action
  addRangeFilter(): void {
    run.debounce(this, this._addRangeFilter, 1000);
  }

  @action
  orderingDirectionChanged(direction: OrderDirection): void {
    console.log('orderingDirectionChanged', direction);
    // Triggers twice on click, why ? Probably the same in the other filter renderers, needs checking
    this.args.handler.applyOrder(this.args.column, direction);
  }

  @action
  existenceFilterChanged(value: string): void {
    console.log('existenceFilterChanged', value);
    // Triggers twice on click, why ? Probably the same in the other filter renderers, needs checking
    this.args.handler.applyFilters(this.args.column, [{ key: 'existence', value }]);
  }

  @action
  removeColumn(): void {
    this.args.handler.destroyTetherInstance();
    this.args.handler.removeColumn(this.args.column.definition);
  }

  @action
  reset(): void {
    this.lowerBoundFilter = '';
    this.upperBoundFilter = '';
    this.args.handler.resetColumns([this.args.column]);
  }
}
