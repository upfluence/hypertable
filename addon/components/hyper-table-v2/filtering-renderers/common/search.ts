import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2FilteringRenderersSearchArgs {
  handler: TableHandler;
  column: Column;
  registerResetCallback(any: (...args: any[]) => void): void;
}

const SEARCH_DEBOUNCE_TIME: number = 300;

export default class HyperTableV2FilteringRenderersSearch extends Component<HyperTableV2FilteringRenderersSearchArgs> {
  @tracked searchQuery: string = '';

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersSearchArgs) {
    super(owner, args);

    if (typeof this.args.registerResetCallback !== 'function') {
      throw new Error(
        '[HyperTableV2::FilteringRenderers::Common::Search] You need to link a method to reset your search input'
      );
    }
    const searchTerm = this.args.column.filters.find((filter) => filter.key === 'value');
    this.searchQuery = searchTerm?.value || '';
    this.args.registerResetCallback(this._resetSearchQuery.bind(this));
  }

  @action
  onInputChanged(): void {
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
        key: 'value',
        value: this.searchQuery
      }
    ]);
  }

  private _resetSearchQuery(): void {
    this.searchQuery = '';
  }
}
