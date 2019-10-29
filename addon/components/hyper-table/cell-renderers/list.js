import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import CellRendererMixin from '@upfluence/hypertable/mixins/cell-renderer';

export default Component.extend(CellRendererMixin, {
  length: computed('value', function() {
    return this.value.length - 1;
  }),

  isEditing: false,

  formattedList: computed('value', function() {
    return this.value.slice(1).join('<br>')
  })
});
