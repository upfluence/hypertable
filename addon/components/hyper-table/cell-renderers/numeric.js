import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import EditableMixin from '@upfluence/hypertable/mixins/editable';

export default Component.extend(EditableMixin, {
  value: computed('item', 'column.key', function() {
    return this.item.get(this.column.key);
  }),

  emptyValue: empty('value')
});
