import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { debounce, scheduleOnce } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';

type FeatureSet = {
  selection: boolean;
  searchable: boolean;
};

type OptionSet = {
  selectionIntlKeyPath?: string;
};

interface HyperTableV2Args {
  handler: TableHandler;
  features: FeatureSet;
  options?: OptionSet;
}

const DEFAULT_FEATURES_SET: FeatureSet = { selection: false, searchable: true };
const RESET_DEBOUNCE_TIME = 300;

export default class HyperTableV2 extends Component<HyperTableV2Args> {
  loadingSkeletons = new Array(3);
  innerTableElement?: Element;

  @tracked loadingResetFilters = false;
  @tracked scrollableTable: boolean = false;
  @tracked initialFetchColumnsDone: boolean = false;

  private declare hypertableInstanceID: string;

  constructor(owner: unknown, args: HyperTableV2Args) {
    super(owner, args);
    args.handler.fetchColumnDefinitions();
    args.handler.fetchColumns().then(() => {
      this.initialFetchColumnsDone = true;
      args.handler.fetchRows();
      this.computeScrollableTable();
    });

    this.hypertableInstanceID = crypto.randomUUID();
  }

  get features(): FeatureSet {
    return {
      ...DEFAULT_FEATURES_SET,
      ...(this.args.features || {})
    };
  }

  get selectionCount(): number {
    if (
      !this.args.handler.rowsMeta ||
      (Array.isArray(this.args.handler.selection) && isEmpty(this.args.handler.selection))
    ) {
      return 0;
    }

    if (this.args.handler.selection === 'all') {
      return this.args.handler.rowsMeta.total - this.args.handler.exclusion.length;
    } else {
      return this.args.handler.selection.length;
    }
  }

  @action
  computeScrollableTable(): void {
    const table = this.innerTableElement;

    if (table) {
      this.scrollableTable = Math.ceil(table.scrollLeft) + table.clientWidth < table.scrollWidth;
      return;
    }

    this.scrollableTable = false;
  }

  @action
  setupInnerTableElement(element: Element): void {
    this.innerTableElement = element;

    if (element) {
      scheduleOnce('afterRender', this, this._setupInnerTableElement, this.innerTableElement);
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
  resetFilters(): void {
    debounce(this, this._resetFilters, RESET_DEBOUNCE_TIME);
  }

  @action
  toggleSelectAll(value: boolean): void {
    this.args.handler.toggleSelectAll(value);
  }

  @action
  selectAllGlobal(): void {
    this.args.handler.selectAllGlobal();
  }

  @action
  clearSelection(): void {
    this.args.handler.clearSelection();
  }

  @action
  toggleRowSelection(row: Row): void {
    if (this.args.handler.selection === 'all') {
      this.args.handler.updateExclusion(row);
    } else {
      this.args.handler.updateSelection(row);
    }
  }

  @action
  scrollToEnd(): void {
    const table = this.innerTableElement;

    if (table) {
      scheduleOnce('afterRender', this, this._scrollToEnd, table);
    }
  }

  @action
  onRowClick(row: Row): void {
    this.args.handler.triggerEvent('row-click', row);
  }

  @action
  onRowHover(row: Row, hovered: boolean): void {
    set(this.args.handler.rows[this.args.handler.rows.indexOf(row)], 'hovered', hovered);
  }

  @action
  reloadPage(): void {
    window.location.reload();
  }

  get columnsCountStyle(): string {
    return htmlSafe(`--hypertable-responsive-columns-number: ${this.args.handler.columns.length - 1}`);
  }

  private _resetFilters(): void {
    this.loadingResetFilters = true;
    this.args.handler.resetColumns(this.args.handler.columns).finally(() => {
      this.loadingResetFilters = false;
    });
  }

  private _scrollToEnd(table: HTMLElement): void {
    table.scrollLeft = table.scrollWidth;
  }

  private _setupInnerTableElement(table: HTMLElement): void {
    table.addEventListener('scroll', () => {
      this.args.handler.destroyTetherInstance();
      if (table.scrollLeft === table.scrollWidth - table.clientWidth) {
        this.scrollableTable = false;
      } else if (!this.scrollableTable) {
        this.scrollableTable = true;
      }
    });

    this.computeScrollableTable();
  }
}
