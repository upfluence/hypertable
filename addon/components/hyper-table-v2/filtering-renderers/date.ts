import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column } from '@upfluence/hypertable/core/interfaces';
import { action } from '@ember/object';

interface HyperTableV2FilteringRenderersDateArgs {
  handler: TableHandler;
  column: Column;
}

export type FilterOption = 'moving' | 'fixed';

const DEFAULT_MOVING_OPTION_KEY: FilterOption = 'moving';

export default class HyperTableV2FilteringRenderersDate extends Component<HyperTableV2FilteringRenderersDateArgs> {
  @tracked _currentDateValue: Date[] = [];
  @tracked _currentMovingDateOption: any;
  @tracked filterOption: FilterOption;

  protected movingOptionKey = DEFAULT_MOVING_OPTION_KEY;

  private _calendarContainer: any = null;

  filteringOptions: { label: string; value: FilterOption }[] = [
    { label: 'Moving', value: this.movingOptionKey },
    { label: 'Fixed', value: 'fixed' }
  ];

  movingDateOptions = Object.freeze({
    Today: 'today',
    Yesterday: 'yesterday',
    'This Week': 'this_week',
    'Last Week': 'last_week',
    'This Month': 'this_month',
    'This Year': 'this_year'
  });

  orderingOptions = {
    'Oldest — Newest': 'asc',
    'Newest — Oldest': 'desc'
  };

  constructor(owner: unknown, args: HyperTableV2FilteringRenderersDateArgs) {
    super(owner, args);

    let filter = this.args.column.filters.find((f) => f.key === this.movingOptionKey);
    this._currentMovingDateOption = filter ? filter.value : null;
    this.filterOption = this._currentMovingDateOption ? this.movingOptionKey : 'fixed';
    args.handler.on('reset-columns', (columns) => {
      if (columns.includes(args.column)) {
        this._resetStates();
      }
    });
    this._initBounderingFilters();
  }

  private _initBounderingFilters(): void {
    let lowerBoundFilter = this.args.column.filters.find((filter) => filter.key === 'lower_bound');
    let upperBoundFilter = this.args.column.filters.find((filter) => filter.key === 'upper_bound');
    if (lowerBoundFilter && upperBoundFilter) {
      this._currentDateValue = [
        moment.unix(parseInt(lowerBoundFilter.value)).toDate(),
        moment.unix(parseInt(upperBoundFilter.value)).toDate()
      ];
    } else {
      this._currentDateValue = [];
    }
  }

  private _handleFlatpickrClick(e: any): void {
    e.stopPropagation();
  }

  @action
  openedFlatpickr(...args: any): void {
    this._calendarContainer = args[2].calendarContainer;
    this._calendarContainer.addEventListener('click', this._handleFlatpickrClick);
  }

  @action
  closedFlatpickr(): void {
    this._calendarContainer.removeEventListener('click', this._handleFlatpickrClick);
  }

  @action
  filterOptionChanged(value: FilterOption): void {
    this.filterOption = value;
  }

  @action
  selectMovingDate(value: any): void {
    this._currentMovingDateOption = value;
    this.args.handler.applyFilters(this.args.column, [
      { key: 'lower_bound', value: '' },
      { key: 'upper_bound', value: '' },
      { key: this.movingOptionKey, value: value }
    ]);
  }

  @action
  selectFixedDate(value: any): void {
    let [fromDate, toDate] = value;

    if (fromDate && toDate) {
      this.args.handler.applyFilters(this.args.column, [
        { key: this.movingOptionKey, value: '' },
        { key: 'lower_bound', value: (+fromDate / 1000).toString() },
        { key: 'upper_bound', value: (+toDate / 1000).toString() }
      ]);
    }
  }

  @action
  removeColumn(): void {
    this.args.handler.removeColumn(this.args.column.definition);
  }

  private _resetStates(): void {
    this._currentDateValue = [];
    this._currentMovingDateOption = [];
  }
}
