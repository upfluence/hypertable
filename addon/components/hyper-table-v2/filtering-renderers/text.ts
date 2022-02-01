import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2FilteringRenderersTextArgs {
  handler: TableHandler;
  column: Column;
}

export default class HyperTableV2FilteringRenderersText extends Component<HyperTableV2FilteringRenderersTextArgs> {
  @tracked _searchQuery: string = '';

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersTextArgs) {
    super(owner, args);

    const searchTerm = this.args.column.filters.find((filter) => filter.key === 'value');
    this._searchQuery = searchTerm?.value || '';
  }

  get searchQuery(): string {
    return this._searchQuery;
  }

  set searchQuery(value: string) {
    this._searchQuery = value;

    this.args.handler.applyFilters(this.args.column, [
      {
        key: 'value',
        value
      }
    ]);
  }

  @action
  reset(): void {
    this._searchQuery = '';
    this.args.handler.resetColumns([this.args.column]);
  }

  @action
  removeColumn(): void {
    this.args.handler.destroyTetherInstance();
    this.args.handler.removeColumn(this.args.column.definition);
  }
}
