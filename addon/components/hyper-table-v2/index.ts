import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';
import { debounce } from '@ember/runloop';
import { scheduleOnce } from '@ember/runloop';

type FeatureSet = {
  selection: boolean;
  searchable: boolean;
};

interface HyperTableV2Args {
  handler: TableHandler;
  features: FeatureSet;
  onRowClick(row: Row): void;
}

const DEFAULT_FEATURES_SET: FeatureSet = { selection: false, searchable: true };
const SEARCH_DEBOUNCE_TIME = 300;

export default class HyperTableV2 extends Component<HyperTableV2Args> {
  @service declare intl: any;
  @tracked searchQuery: string = '';

  loadingSkeletons = new Array(3);
  innerTableElement?: Element;

  @tracked loadingResetFilters = false;
  @tracked scrollableTable: boolean = false;

  constructor(owner: unknown, args: HyperTableV2Args) {
    super(owner, args);
    args.handler.fetchColumnDefinitions();
    args.handler.fetchColumns().then(() => {
      args.handler.fetchRows();
      this.computeScrollableTable();
    });
  }

  get features(): FeatureSet {
    return {
      ...DEFAULT_FEATURES_SET,
      ...(this.args.features || {})
    };
  }

  @action
  computeScrollableTable(): void {
    const table = this.innerTableElement?.querySelector('.hypertable');

    if (table) {
      this.scrollableTable = Math.ceil(table.scrollLeft) + table.clientWidth < table.scrollWidth;
      return;
    }

    this.scrollableTable = false;
  }

  get searchPlaceholder(): string {
    if (this.args.handler.columns[0].definition.name)
      return this.intl.t('hypertable.header.search_by') + ' ' + this.args.handler.columns[0].definition.name;
    return this.intl.t('hypertable.header.search');
  }

  @action
  setupInnerTableElement(element: Element): void {
    this.innerTableElement = element;

    const table = element.querySelector('.hypertable');

    if (table) {
      scheduleOnce('afterRender', this, () => {
        table.addEventListener('scroll', () => {
          if (table.scrollLeft === table.scrollWidth - table.clientWidth) {
            this.scrollableTable = false;
          } else if (!this.scrollableTable) {
            this.scrollableTable = true;
          }
        });

        this.computeScrollableTable();
      });
    }
  }

  @action
  reorderColumns(columns: Column[]): void {
    this.args.handler.reorderColumns([this.args.handler.columns[0]].concat(columns));
  }

  @action
  onBottomReached(): void {
    this.args.handler.onBottomReached();
  }

  @action
  resetFilters() {
    this.loadingResetFilters = true;
    this.args.handler.resetColumns(this.args.handler.columns).finally(() => {
      this.loadingResetFilters = false;
    });
  }

  onSearchInput(): void {
    debounce(this, this._applySearchFilter, SEARCH_DEBOUNCE_TIME);
  }

  @action
  onClearSearch(): void {
    this.searchQuery = '';
    this._applySearchFilter();
  }

  @action
  toggleSelectAll(value: boolean) {
    this.args.handler.toggleSelectAll(value);
  }

  @action
  toggleRowSelection(row: Row): void {
    this.args.handler.updateSelection(row);
  }

  @action
  scrollToEnd(): void {
    const table = this.innerTableElement?.querySelector('.hypertable');

    if (table) {
      scheduleOnce('afterRender', this, () => {
        table.scrollLeft = table.scrollWidth;
      });
    }
  }

  private _applySearchFilter(): void {
    this.args.handler.applyFilters(this.args.handler.columns[0], [
      {
        key: 'value',
        value: this.searchQuery
      }
    ]);
  }
}
