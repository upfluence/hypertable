import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, OrderDirection } from '@upfluence/hypertable/core/interfaces';
import { tracked } from '@glimmer/tracking';
import { IntlService } from 'ember-intl';

interface HyperTableV2FilteringRenderersExistenceArgs {
  handler: TableHandler;
  column: Column;
  label?: string;
  filteringKey?: string;
  existenceFilters?: { [key: string]: OrderDirection };
  activateWithValue?: boolean;
  onExistenceFilterChange?(value: string): Promise<void>;
}

const defaultFilteringKey = 'existence';

const defaultExistenceFilters = {
  'With Value': 'with',
  'Without Value': 'without'
};

export default class HyperTableV2FilteringRenderersExistence extends Component<HyperTableV2FilteringRenderersExistenceArgs> {
  @tracked private currentSelection: string | undefined;
  @service declare intl: IntlService;

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersExistenceArgs) {
    super(owner, args);

    args.handler.on('reset-columns', (columns) => {
      if (columns.includes(args.column)) {
        this.currentSelection = undefined;
      }
    });
  }

  get label(): string {
    return this.args.label ?? this.intl.t('hypertable.column.filtering.existence.label');
  }

  get existenceFilters(): { [key: string]: string } {
    return this.args.existenceFilters ?? defaultExistenceFilters;
  }

  get currentExistenceFilter(): string | null {
    const existenceFilter = this.args.column.filters.find((filter) => filter.key === this.filteringKey);

    if (this.currentSelection) {
      return this.currentSelection;
    }
    if (existenceFilter) {
      return existenceFilter.value;
    }

    return this.currentSelection ?? (this.args.activateWithValue ? 'with' : null);
  }

  @action
  existenceFilterChanged(value: string): void {
    if (this.args.onExistenceFilterChange) {
      this.args.onExistenceFilterChange(value).then(() => {
        this.currentSelection = value;
      });
      return;
    }
    this.args.handler.applyFilters(this.args.column, [{ key: this.filteringKey, value }]).then(() => {
      this.currentSelection = value;
    });
  }

  private get filteringKey(): string {
    return this.args.filteringKey ?? defaultFilteringKey;
  }
}
