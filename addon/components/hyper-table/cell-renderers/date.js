import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty, or } from '@ember/object/computed';
import { typeOf } from '@ember/utils';

import moment from 'moment';

export default Component.extend({
  classNameBindings: ['emptyValue'],
  classNames: ['cell-container'],

  value: computed('item', 'column.key', function () {
    return this.item.get(this.column.key);
  }),

  emptyValue: empty('value'),

  _defaultDateFormat: 'YYYY-MM-DD',
  _dateFormat: or('column.date_format', '_defaultDateFormat'),

  _formattedDate: computed('value', '_dateFormat', function () {
    let _date;

    if (typeOf(this.value) === 'date') {
      _date = moment(this.value);
    } else {
      _date = moment.unix(this.value);
    }

    return _date.format(this._dateFormat);
  }),
  isEditing: false,

  actions: {
    toggleEditing() {
      this.set('isEditing', true);
      this.flatpickrRef.open();
    },
    onCalendarClose() {
      this.set('isEditing', false);
    },
    updateDate(date) {
      this.item.set(this.column.property, +date[0] / 1000);
      this.set('_formattedDate', date);
      this.set('isEditing', false);
    }
  }
});
