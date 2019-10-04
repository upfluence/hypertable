
import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { run } from '@ember/runloop';

export default Component.extend({
  tagName: '',

  value: computed('item', 'column.property', function() {
    return this.item.get(this.column.property);
  }),

  emptyValue: empty('value'),
  isEditing: false,

  actions: {
    toggleEditing() {
      this.toggleProperty("isEditing");
      
      if(this.get('isEditing')) {
        run.scheduleOnce('afterRender', this, function() {
          document.querySelector(".editing-input").focus();
        });
      }
      
    }
  }
});
