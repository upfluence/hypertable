import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';
import { isTesting } from '@embroider/macros';

import { debounce } from '@ember/runloop';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, OrderDirection } from '@upfluence/hypertable/core/interfaces';
import { onlyNumeric } from '@upfluence/hypertable/utils';

interface HyperTableV2FilteringRenderersNumericArgs {
  handler: TableHandler;
  column: Column;
}

const RANGE_DEBOUNCE_TIME = 500;
const DEFAULT_MULTIPLIER = 1;

export default class HyperTableV2FilteringRenderersNumeric extends Component<HyperTableV2FilteringRenderersNumericArgs> {
  @tracked lowerBoundFilter: string = '';
  @tracked upperBoundFilter: string = '';

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

    this.initLowerBound();
    this.initUpperBound();
  }

  get multiplier(): number {
    return DEFAULT_MULTIPLIER;
  }

  get hasBoundFiltersDefined(): boolean {
    return this.lowerBoundFilter || this.upperBoundFilter ? true : false;
  }

  @computed('args.column.filters.[]')
  get showBounds(): boolean {
    return this.args.column.filters[0]?.value === 'with';
  }

  setupOnlyNumericListener(element: HTMLElement): void {
    const input = element.querySelector('input');
    input?.addEventListener('keydown', onlyNumeric);
  }

  teardownOnlyNumericListener(element: HTMLElement): void {
    const input = element.querySelector('input');
    input?.removeEventListener('keydown', onlyNumeric);
  }

  @action
  onExistenceChange(value: string): void {
    if (value === 'without') {
      this._resetStates();
    }
    this.args.handler.applyFilters(this.args.column, [
      { key: 'existence', value },
      { key: 'lower_bound', value: this.lowerBoundFilter },
      { key: 'upper_bound', value: this.upperBoundFilter }
    ]);
  }

  @action
  addRangeFilter(): void {
    debounce(this, this._addRangeFilter, isTesting() ? 0 : RANGE_DEBOUNCE_TIME);
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

  private _addRangeFilter(): void {
    this.args.handler.applyFilters(this.args.column, [
      ...(this.lowerBoundFilter
        ? [{ key: 'lower_bound', value: (parseInt(this.lowerBoundFilter) * this.multiplier).toString() }]
        : []),
      ...(this.upperBoundFilter
        ? [{ key: 'upper_bound', value: (parseInt(this.upperBoundFilter) * this.multiplier).toString() }]
        : [])
    ]);
  }

  private initLowerBound(): void {
    this.lowerBoundFilter = '';

    if (this.args.column.filters.find((filter) => filter.key === 'lower_bound')?.value) {
      this.lowerBoundFilter = (
        parseInt(this.args.column.filters.find((filter) => filter.key === 'lower_bound')!.value) / this.multiplier
      ).toString();
    }
  }

  private initUpperBound(): void {
    this.upperBoundFilter = '';

    if (this.args.column.filters.find((filter) => filter.key === 'upper_bound')?.value) {
      this.upperBoundFilter = (
        parseInt(this.args.column.filters.find((filter) => filter.key === 'upper_bound')!.value) / this.multiplier
      ).toString();
    }
  }
}
