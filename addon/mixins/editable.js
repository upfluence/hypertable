import Mixin from '@ember/object/mixin';
import { run } from '@ember/runloop';

export default Mixin.create({
  isEditing: false,

  actions: {
    toggleEditing() {
      this.toggleProperty("isEditing");
      
      if(this.get('isEditing')) {
        run.scheduleOnce('afterRender', this, () => {
          this.$('.editing-input__field').focus();
        });
      } else {
        this.manager.updateColumnValue(this.column.property, this.item, this.value);
      }
    }
  }
});