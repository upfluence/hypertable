import Mixin from '@ember/object/mixin';
import { run } from '@ember/runloop';

export default Mixin.create({
  actions: {
    toggleEditing(value) {
      if(!this.get('item.editStatus.status')){
        this.item.set('editStatus', {key: this.column.key, status: 'editing'})
        run.scheduleOnce('afterRender', this, () => {
          this.$('.editing-input__field').focus();
        });
      } else if(this.get('item.editStatus.status') !== 'success') {
        run.once(this, () => {
          this.item.set('editStatus', {key: this.column.key, status: 'saving'});
          this.manager.updateColumnValue(this.column.key, this.item, value);
          this.onLiveEdit({key: this.column.key, field: this.item, value});
        });
      }
    },

    updateCurrency(currency) {
      this.manager.updateColumnValue(this.column.currency_key, this.item, currency);
    }
  }
});
