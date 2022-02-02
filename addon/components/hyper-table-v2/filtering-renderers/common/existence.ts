import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, OrderDirection } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2FilteringRenderersExistenceArgs {
  handler: TableHandler;
  column: Column;
  label?: string;
  existenceFilters?: { [key: string]: OrderDirection };
  activateWithValue?: boolean;
}

const defaultExistenceFilters = {
  'With Value': 'with',
  'Without Value': 'without'
};

export default class HyperTableV2FilteringRenderersExistence extends Component<HyperTableV2FilteringRenderersExistenceArgs> {
  @service declare intl: any;

  get label(): string {
    return this.args.label || this.intl.t('hypertable.column.filtering.existence.label');
  }

  get existenceFilters(): { [key: string]: string } {
    return this.args.existenceFilters || defaultExistenceFilters;
  }

  get currentExistenceFilter(): string | null {
    const _existenceFilter = this.args.column.filters.find((filter) => filter.key === 'existence');

    if (_existenceFilter) {
      return _existenceFilter.value;
    }

    return this.args.activateWithValue ? 'with' : null;
  }

  @action
  existenceFilterChanged(value: string): void {
    this.args.handler.applyFilters(this.args.column, [{ key: 'existence', value }]);
  }
}
