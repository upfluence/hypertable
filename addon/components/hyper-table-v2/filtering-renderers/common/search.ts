import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column } from '@upfluence/hypertable/core/interfaces';
import { onlyNumeric } from '@upfluence/hypertable/utils';

interface HyperTableV2FilteringRenderersSearchArgs {
  handler: TableHandler;
  column: Column;
  filterKey?: string;
  type?: string;
}

const SEARCH_DEBOUNCE_TIME: number = 300;
const DEFAULT_FILTER_KEY: string = 'value';

export default class HyperTableV2FilteringRenderersSearch extends Component<HyperTableV2FilteringRenderersSearchArgs> {
  @tracked searchQuery: string = '';

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersSearchArgs) {
    super(owner, args);

    const searchTerm = this.args.column.filters.find((filter) => filter.key === 'value');
    this.searchQuery = searchTerm?.value || '';
    args.handler.on('reset-columns', (columns) => {
      if (columns.includes(args.column)) {
        this.searchQuery = '';
      }
    });
  }

  get filterKey(): string {
    return this.args.filterKey ?? DEFAULT_FILTER_KEY;
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
  onInputChanged(value: string): void {
    this.searchQuery = value;

    debounce(this, this._applyFilters, SEARCH_DEBOUNCE_TIME);
  }

  @action
  onClearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchQuery = '';
    this._applyFilters();
  }

  private _applyFilters(): void {
    this.args.handler.applyFilters(this.args.column, [
      {
        key: this.filterKey,
        value: this.searchQuery
      }
    ]);
  }
}
