import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { run } from '@ember/runloop';

export default Component.extend({
  value: computed('item', 'column.property', function() {
    let list = this.item.get(this.column.property);
    if(list){
      return list;
    }
  }),

  length: computed('value', function() {
    return this.value.length - 1;
  }),

  emptyValue: empty('value'),
  isEditing: false,

  actions: {
    toggleEditing() {
      let self = this;
      this.toggleProperty("isEditing");
      
      if(this.get('isEditing')) {
        run.scheduleOnce('afterRender', this, function() {
          self.$('.editing-input__field').focus();
        });
      } else {
        this.manager.updateColumnValue(this.column.property, this.item, this.value);
      }
    }
  }
});
