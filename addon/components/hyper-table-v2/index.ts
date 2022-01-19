import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';

type FeatureSet = {
  selection: boolean;
}

interface HyperTableV2Args {
  handler: TableHandler;
  features: FeatureSet;
  onRowClick(row: Row): void;
}

const DEFAULT_FEATURES_SET: FeatureSet = { selection : false };

export default class HyperTableV2 extends Component<HyperTableV2Args> {
  loadingSkeletons = new Array(3);
  @tracked loadingResetFilters = false;

  constructor(owner: unknown, args: HyperTableV2Args) {
    super(owner, args);
    args.handler.fetchColumnDefinitions();
    args.handler.fetchColumns().then(() => {
      args.handler.fetchRows();
    });
  }

  get features(): FeatureSet {
    return {
      ...DEFAULT_FEATURES_SET,
      ...(this.args.features || {})
    }
  }

  @action
  reorderColumns(columns: Column[]): void {
    this.args.handler.reorderColumns([this.args.handler.columns[0]].concat(columns));
  }

  @action
  onBottomReached() {
    this.args.handler.onBottomReached();
  }

  @action
  resetFilters() {
    this.loadingResetFilters = true;
    this.args.handler.resetColumns(this.args.handler.columns).finally(() => {
      this.loadingResetFilters = false;
    });
  }

  @action
  toggleSelectAll(value: boolean) {
    this.args.handler.toggleSelectAll(value);
  }

  @action
  toggleRowSelection(row: Row) {
    this.args.handler.updateSelection(row);
  }
}
