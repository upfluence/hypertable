import Component from '@ember/component';
import EditableMixin from '@upfluence/hypertable/mixins/editable';
import CellRendererMixin from '@upfluence/hypertable/mixins/cell-renderer';

export default Component.extend(EditableMixin, CellRendererMixin, {
  actions: {
    setRating(rating) {
      console.log(rating);
      this.send('toggleEditing', rating, true);
    }
  }
});


