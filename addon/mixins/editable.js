import Mixin from '@ember/object/mixin';
import EmberObject, { computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Mixin.create({
  classNameBindings: ['editStatus.status', 'isUpsertable'],

  editStatus: computed('manager.{editStatus.[],editStatus.@each.status}', 'element.id', function () {
    return this.manager.get('editStatus').findBy('id', this.element.id);
  }),

  isSuccess: computed.equal('editStatus.status', 'success'),
  isEditing: computed.equal('editStatus.status', 'editing'),
  isSaving: computed.equal('editStatus.status', 'saving'),
  isError: computed.equal('editStatus.status', 'error'),
  isUpsertable: computed.equal('column.upsertable', true),

  actions: {
    toggleEditing(value, autosave = false) {
      if (value && typeof value !== 'string') {
        value = value.toString();
      }

      let editStatus = this.manager.get('editStatus');
      let elementEditStatus = editStatus.findBy('id', this.element.id);

      // check if autosave is set to true
      // will initialize the item's edit status
      if (autosave) {
        this.manager.editStatus.pushObject(
          EmberObject.create({
            key: this.column.key,
            status: 'editing',
            item: this.item,
            id: this.element.id
          })
        );
      }

      // no editing status -> user hasn't started modification
      // editing status = success -> user has finished modification
      // other than these 2 statuses means an edit is still on going and the hook will be called
      if (autosave || (elementEditStatus && elementEditStatus.status !== 'success')) {
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
      if (!elementEditStatus) {
        this.manager.editStatus.pushObject(
          EmberObject.create({
            key: this.column.key,
            status: 'editing',
            item: this.item,
            id: this.element.id
          })
        );
      } else {
        elementEditStatus.set('status', 'editing');
      }

      // automatically focuses the input
      // eslint-disable-next-line ember/no-incorrect-calls-with-inline-anonymous-functions
      run.scheduleOnce('afterRender', this, () => {
        this.$('.editing-input__field').focus();
      });
    },

    updateCurrency(currency) {
      this.item.set(this.column.currency_key, currency);
    }
  }
});
