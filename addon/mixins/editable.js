import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Mixin.create({
  classNameBindings: [`editStatus.status`],

  editStatus: computed('manager.editStatus', 'column.key', function() {
    if (
      this.item === this.manager.get('editStatus.item') &&
      this.column.key === this.manager.get('editStatus.key')
    ) return this.manager.editStatus;
  }),

  isSuccess: computed.equal('editStatus.status', 'success'),
  isEditing: computed.equal('editStatus.status', 'editing'),
  isSaving: computed.equal('editStatus.status', 'saving'),
  isError: computed.equal('editStatus.status', 'error'),

  actions: {
    toggleEditing(value) {
      if (!this.get('editStatus.status') || this.manager.get('editStatus.status') === 'success') {
        if (this.value !== this.editableValue) {
          this.set('editableValue', this.value);
        }

        this.manager.set('editStatus', {
          key: this.column.key,
          status: 'editing',
          item: this.item
        });

        run.scheduleOnce('afterRender', this, () => {
          this.$('.editing-input__field').focus();
        });
      } else if (this.get('editStatus.status') !== 'success') {
        this.manager.hooks.onLiveEdit({
          key: this.column.key,
          field: this.item,
          value
        });
      }
    },

    updateCurrency(currency) {
      this.item.set(this.column.currency_key, currency);
    }
  }
});
