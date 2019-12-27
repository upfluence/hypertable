import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Mixin.create({
  classNameBindings: [`editStatus.status`],

  editStatus: computed('manager.editStatus', 'column.key', function() {
    let editStatus = this.manager.get('editStatus').filterBy('id', this.element.id)
    let { item, key } = editStatus[0] || {}

    if (this.item === item && this.column.key === key) {
      return editStatus[0];
    }
  }),

  isSuccess: computed.equal('editStatus.status', 'success'),
  isEditing: computed.equal('editStatus.status', 'editing'),
  isSaving: computed.equal('editStatus.status', 'saving'),
  isError: computed.equal('editStatus.status', 'error'),

  actions: {
    toggleEditing(value) {
      let editStatus = this.manager.get('editStatus');
      let elementEditStatus = editStatus.filterBy('id', this.element.id)

      // no editing status -> user hasn't started modification
      // editing status = success -> user has finished modification
      // other than these 2 statuses means an edit is still on going and the hook will be called
      if(elementEditStatus[0] && elementEditStatus[0].status !== 'success') {
        this.manager.hooks.onLiveEdit({
          key: this.column.key,
          item: this.item,
          value,
          id: this.element.id
        });
        return;
      }

      // this is useful if user has abandoned a modification while it was unsaved or unvalidated
      // it will visually reset the unsaved value to the real value saved in the backend
      if (this.value !== this.editableValue) {
        this.set('editableValue', this.value);
      }

      // sets the global editing status to let the table know of any on going editing
      // this.manager.set('editStatus', {
      //   key: this.column.key,
      //   status: 'editing',
      //   item: this.item,
      //   id: this.element.id
      // });

      let editableStatus = {
        key: this.column.key,
        status: 'editing',
        item: this.item,
        id: this.element.id
      }

      if(!elementEditStatus.length) {
        let newStatus = [...editStatus, editableStatus]
        this.manager.set('editStatus', newStatus)
      } else {
        let index = editStatus.indexOf(elementEditStatus[0])
        let newStatus = [...editStatus].replace(index, 1, [editableStatus])
        this.manager.set('editStatus', newStatus)
      }

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
