import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import TableHandler from '@upfluence/hypertable/core/handler';
import { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';

interface HyperTableV2SearchArgs {
  handler: TableHandler;
}

const SEARCH_DEBOUNCE_TIME = 300;

export default class HyperTableV2Search extends Component<HyperTableV2SearchArgs> {
  @service declare intl: any;
  @tracked searchQuery: string = '';

  get searchPlaceholder(): string {
    if (this.args.handler?.columns[0]?.definition?.name)
      return this.intl.t('hypertable.header.search_by') + ' ' + this.args.handler.columns[0].definition.name;
    return this.intl.t('hypertable.header.search');
  }

  @action
  onClearSearch(): void {
    this.searchQuery = '';
    this._applySearchFilter();
  }

  @action
  onSearchInput(): void {
    debounce(this, this._applySearchFilter, SEARCH_DEBOUNCE_TIME);
  }

  private _applySearchFilter(): void {
    this.args.handler.applyFilters(this.args.handler.columns[0], [
      {
        key: this.args.handler?.columns[0]?.definition?.filterable_by?.[0] || 'value',
        value: this.searchQuery
      }
    ]);
  }
}
