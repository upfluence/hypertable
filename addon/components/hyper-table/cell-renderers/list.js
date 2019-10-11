import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';

export default Component.extend({
  value: computed('item', 'column.property', function() {
    return this.item.get(this.column.property);
  }),

  length: computed('value', function() {
    return this.value.length - 1;
  }),

  emptyValue: empty('value'),
  isEditing: false,

  formattedList: computed('value', function() {
    return this.value.slice(1).join('<br>')
  })
});
