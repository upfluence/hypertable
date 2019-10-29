import Component from '@ember/component';
import { computed } from '@ember/object';
import EditableMixin from '@upfluence/hypertable/mixins/editable';
import CellRendererMixin from '@upfluence/hypertable/mixins/cell-renderer';

export default Component.extend(EditableMixin, CellRendererMixin, {
  truncatedText: computed('value', function() {
    let text = this.value;
    let limit = 85;
    let truncatedText = '';

    if (text != null && text.length > 0) {
      truncatedText = text.substr(0, limit);

      if (text.length > limit) {
        truncatedText += ' (...)';
      }
    }

    return truncatedText;
  }),
});
