import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, OrderDirection } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2FilteringRenderersTextArgs {
  handler: TableHandler;
  column: Column;
}

export default class HyperTableV2FilteringRenderersText extends Component<HyperTableV2FilteringRenderersTextArgs> {
  @tracked _searchQuery: string = '';

  orderingDirections: { [key: string]: OrderDirection } = Object.freeze({
    'A — Z': 'asc',
    'Z — A': 'desc'
  });

  existenceFilters = Object.freeze({
    'With Value': 'with',
    'Without Value': 'without'
  });

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersTextArgs) {
    super(owner, args);

    const searchTerm = this.args.column.filters.find((filter) => filter.key === 'value');
    this._searchQuery = searchTerm?.value || '';
  }

  get currentOrderingDirection() {
    return this.args.column.order?.direction;
  }

  get currentExistenceFilter() {
    const _existenceFilter = this.args.column.filters.find((filter) => filter.key === 'existence');

    if (_existenceFilter) {
      return _existenceFilter.value;
    }

    return this._searchQuery ? 'with' : null;
  }

  get searchQuery(): string {
    return this._searchQuery;
  }

  set searchQuery(value: string) {
    console.log('=>', value);
    this._searchQuery = value;

    this.args.handler.applyFilters(this.args.column, [
      {
        key: 'value',
        value
      }
    ]);
  }

  @action
  orderingDirectionChanged(direction: OrderDirection) {
    this.args.handler.applyOrder(this.args.column, direction);
  }

  @action
  existenceFilterChanged(value: string) {
    this.args.handler.applyFilters(this.args.column, [{ key: 'existence', value }]);
  }

  @action
  reset() {
    this.args.handler.resetColumns([this.args.column]);
  }

  @action
  removeColumn() {
    this.args.handler.destroyTetherInstance();
    this.args.handler.removeColumn(this.args.column.definition);
  }
}
