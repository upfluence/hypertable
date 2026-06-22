import { computed } from '@ember/object';
import { empty, oneWay } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  classNameBindings: ['emptyValue'],
  classNames: ['cell-container'],

  value: computed('item', 'column.key', 'manager.{editStatus.[],editStatus.@each.status}', function () {
    return this.item.get(this.column.key);
  }),

  editableValue: oneWay('value'),
  emptyValue: empty('value')
});
