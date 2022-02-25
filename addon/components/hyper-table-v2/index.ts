import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';
import { debounce, scheduleOnce } from '@ember/runloop';

type FeatureSet = {
  selection: boolean;
  searchable: boolean;
};

interface HyperTableV2Args {
  handler: TableHandler;
  features: FeatureSet;
}

const DEFAULT_FEATURES_SET: FeatureSet = { selection: false, searchable: true };
const RESET_DEBOUNCE_TIME = 300;

export default class HyperTableV2 extends Component<HyperTableV2Args> {
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

  get selectionCount(): number {
    if (!this.args.handler.rowsMeta || this.args.handler.selection === []) {
      return 0;
    }

    if (this.args.handler.selection === 'all') {
      return this.args.handler.rowsMeta.total;
    } else {
      return this.args.handler.selection.length;
    }
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
    debounce(this, this._resetFilters, RESET_DEBOUNCE_TIME);
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

  @action
  onRowClick(row: Row) {
    this.args.handler.triggerEvent('row-click', row);
  }

  @action
  onRowHover(row: Row, hovered: boolean) {
    set(this.args.handler.rows[this.args.handler.rows.indexOf(row)], 'hovered', hovered);
  }

  @action
  reloadPage() {
    window.location.reload();
  }

  private _resetFilters(): void {
    this.loadingResetFilters = true;
    this.args.handler.resetColumns(this.args.handler.columns).finally(() => {
      this.loadingResetFilters = false;
    });
  }
}
