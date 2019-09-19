import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',

  imageURL: computed('item', 'column.property', function() {
    return this.item.get(this.column.property);
  })
});
