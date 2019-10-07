
import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { run } from '@ember/runloop';

export default Component.extend({
  value: computed('item', 'column.property', function() {
    return this.item.get(this.column.property);
  }),

  emptyValue: empty('value'),
  isEditing: false,

  actions: {
    toggleEditing() {
      let self = this;

      this.toggleProperty("isEditing");
      
      if(this.get('isEditing')) {
        run.scheduleOnce('afterRender', this, function() {
          self.$('.editing-input').focus();
        });
      }
    }
  }
});
