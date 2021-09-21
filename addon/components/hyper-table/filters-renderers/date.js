import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import moment from 'moment';

import FiltersRenderer from '@upfluence/hypertable/components/hyper-table/filters-renderers';

export default class DateFiltersRenderer extends FiltersRenderer {
  @tracked flatpickrRef = null;
  @tracked filterOption;
  @tracked _currentMovingDateOption;
  @tracked _currentDateValue;

  constructor(owner, args) {
    super(owner, args);

    let filter = this.args.column.filters.find((f) => f.key === 'value');
    this._currentMovingDateOption = filter ? filter.value : null;
    this.filterOption = this._currentMovingDateOption ? 'moving' : 'fixed';

    let lowerBoundFilter = this.args.column.filters.findBy('key', 'lower_bound');
    let upperBoundFilter = this.args.column.filters.findBy('key', 'upper_bound');
    if (lowerBoundFilter && upperBoundFilter) {
      this._currentDateValue = [
        moment.unix(lowerBoundFilter.value).toDate(),
        moment.unix(upperBoundFilter.value).toDate()
      ];
    } else {
      this._currentDateValue = [];
    }
  }

  get orderingOptions() {
    return {
      'Oldest — Newest': `${this.args.column.orderKey}:asc`,
      'Newest — Oldest': `${this.args.column.orderKey}:desc`
    };
  }

  filteringOptions = Object.freeze({
    Moving: 'moving',
    Fixed: 'fixed'
  });

  movingDateOptions = Object.freeze({
    Today: 'today',
    Yesterday: 'yesterday',
    'This Week': 'this_week',
    'Last Week': 'last_week',
    'This Month': 'this_month',
    'This Year': 'this_year'
  });

  _handleFlatpickrClick(e) {
    e.stopPropagation();
  }

  @action
  openedFlatpickr(...args) {
    this.calendarContainer = args[2].calendarContainer;
    this.calendarContainer.addEventListener('click', this._handleFlatpickrClick);
  }

  @action
  closedFlatpickr() {
    this.calendarContainer.removeEventListener('click', this._handleFlatpickrClick);
  }

  @action
  orderingOptionChanged(value) {
    this.args.manager.updateOrdering(this.args.column, value);
  }

  @action
  filterOptionChanged(value) {
    this.filterOption = value;
  }

  @action
  selectMovingDate(value) {
    this.args.column.set('filters', [{ key: 'value', value: value }]);
    this._currentMovingDateOption = value;
    this.args.manager.hooks.onColumnsChange('columns:change');
  }

  @action
  selectFixedDate(value) {
    let [fromDate, toDate] = value;

    if (fromDate && toDate) {
      this.args.column.set('filters', [
        { key: 'lower_bound', value: (+fromDate / 1000).toString() },
        { key: 'upper_bound', value: (+toDate / 1000).toString() }
      ]);

      this.args.manager.hooks.onColumnsChange('columns:change');
    }
  }

  @action
  reset() {
    super.reset();

    this._currentDateValue = [];
    this._currentMovingDateOption = [];

    if (this.flatpickrRef) {
      this.flatpickrRef.clear();
    }
  }
}
