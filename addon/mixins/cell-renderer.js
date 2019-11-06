import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';

export default Mixin.create({
  classNameBindings: ['emptyValue:text-color-default-lighter'],
  classNames: ['cell-container'],
  value: computed('item', 'column.key', function() {
      return this.item.get(this.column.key);
  }),

  emptyValue: empty('value'),
});
