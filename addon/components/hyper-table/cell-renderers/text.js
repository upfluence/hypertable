import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import EditableMixin from '../../../mixins/editable';

export default Component.extend(EditableMixin, {
  value: computed('item', 'column.property', function() {
    return this.item.get(this.column.property);
  }),

  emptyValue: empty('value'),

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
});
