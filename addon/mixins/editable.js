import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Mixin.create({
  classNameBindings: [`editStatus.status`],

  editStatus: computed('item.editStatus', 'column.key', function() {
    if(this.column.key === this.get('item.editStatus.key')) {
      return this.item.editStatus;
    }
  }),

  actions: {
    toggleEditing(value) {
      if(!this.get('editStatus.status')){
        this.item.set('editStatus', {key: this.column.key, status: 'editing'})
        run.scheduleOnce('afterRender', this, () => {
          this.$('.editing-input__field').focus();
        });
      } else if(this.get('editStatus.status') !== 'success') {
        this.manager.hooks.onLiveEdit({key: this.column.key, field: this.item, value});
      }
    },

    updateCurrency(currency) {
      this.item.set(this.column.currency_key, currency);
    }
  }
});
