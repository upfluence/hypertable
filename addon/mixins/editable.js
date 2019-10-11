import Mixin from '@ember/object/mixin';
import { run } from '@ember/runloop';

export default Mixin.create({
  isEditing: false,

  actions: {
    toggleEditing(value, property) {
      this.toggleProperty("isEditing");
      console.log({value, property});
      
      if(this.get('isEditing')) {
        run.scheduleOnce('afterRender', this, () => {
          this.$('.editing-input__field').focus();
        });
      } else {
        this.manager.updateColumnValue(property || this.column.property, this.item, value);
      }
    },
  }
});
