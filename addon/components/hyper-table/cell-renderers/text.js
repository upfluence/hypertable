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

  truncatedText: computed('value', function() {
    let text = this.value;
    let limit = 70;
    let truncatedText = '';

    if (text != null && text.length > 0) {
      truncatedText = text.substr(0, limit);

      if (text.length > limit) {
        truncatedText += ' (...)';
      }
    }

    return truncatedText;
  }),

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
