import Component from '@ember/component';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { run } from '@ember/runloop';

export default Component.extend({
  currency: computed('column', 'column.currency_key', function() {
    if (this.column && !this.column.currency_key) {
      throw new Error(
        '[upf-table/cell-renderers][money] You are trying to render Money without a currency'
      );
    }

    return this.item.get(this.column.currency_key);
  }),

  amount: computed('item', 'column.property', function() {
    return this.item.get(this.column.property);
  }),

  emptyAmount: empty('amount'),
  emptyCurrency: empty('currency'),

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
