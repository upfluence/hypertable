import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';

export default Mixin.create({
  classNameBindings: ['emptyValue'],
  classNames: ['cell-container'],
  value: computed('item', 'column.key', 'manager.editStatus.[]', 'manager.editStatus.@each.status', function() {
    return this.item.get(this.column.key);
  }),
  editableValue: computed.oneWay('value'),
  emptyValue: empty('value')
});
