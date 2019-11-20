import Component from '@ember/component';
import { computed } from '@ember/object';

import EditableMixin from '@upfluence/hypertable/mixins/editable';
import CellRendererMixin from '@upfluence/hypertable/mixins/cell-renderer';

export default Component.extend(EditableMixin, CellRendererMixin, {
  amount: computed('value', function() {
    return (this.value) ? (parseInt(this.value.cents) || 0) / 100 : null;
  }),

  currency: computed('value', function() {
    return (this.value) ? this.value.currency : null;
  }),

  emptyValue: computed('amount', 'currency', function() {
    return !(this.amount && this.currency);
  })
});
