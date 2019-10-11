import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';

export default Component.extend({
  value: computed('item', 'column.property', function() {
    let list = this.item.get(this.column.property);
    if(list) {
      return list;
    }
  }),

  length: computed('value', function() {
    return this.value.length - 1;
  }),

  emptyValue: empty('value'),
  isEditing: false,

  formattedList: computed('value', function() {
    let htmlValue = ''
    this.value.forEach(function(item, index) {
      if(index != 0){
        htmlValue+= item + '<br>'
      }
    });
    return htmlValue
  })
});
