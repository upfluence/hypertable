import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Mixin.create({
  classNameBindings: [`editStatus.status`],

  editStatus: computed('manager.editStatus', 'column.key', function() {
    let { item, key } = this.manager.editStatus || {}
    if (this.item === item && this.column.key === key)
      return this.manager.editStatus;
  }),

  isSuccess: computed.equal('editStatus.status', 'success'),
  isEditing: computed.equal('editStatus.status', 'editing'),
  isSaving: computed.equal('editStatus.status', 'saving'),
  isError: computed.equal('editStatus.status', 'error'),

  actions: {
    toggleEditing(value) {
      let status = this.manager.getWithDefault('editStatus.status', 'success');

      // no editing status -> user hasn't started modification
      // editing status = success -> user has finished modification
      // other than these 2 statuses means an edit is still on going and the hook will be called
      if(this.get('editStatus.status') && status !== 'success') {
        this.manager.hooks.onLiveEdit({
          key: this.column.key,
          field: this.item,
          value
        });
        return;
      }

      // this is useful if user has abandoned a modification while it was unsaved or unvalidated
      // it will visually reset the unsaved value to the real value saved in the backend
      if (this.value !== this.editableValue) {
        this.set('editableValue', this.value);
      }

      // sets the global editing status to let the table know of any on going editing
      this.manager.set('editStatus', {
        key: this.column.key,
        status: 'editing',
        item: this.item
      });

      // automatically focuses the input
      run.scheduleOnce('afterRender', this, () => {
        this.$('.editing-input__field').focus();
      });
    },

    updateCurrency(currency) {
      this.item.set(this.column.currency_key, currency);
    }
  }
});
