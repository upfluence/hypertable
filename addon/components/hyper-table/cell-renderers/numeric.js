import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import EditableMixin from '../../../mixins/editable';

export default Component.extend(EditableMixin, {
  value: computed('item', 'column.property', function() {
    return this.item.get(this.column.property);
  }),

  emptyValue: empty('value'),
});
