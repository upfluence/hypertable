import Component from '@ember/component';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

import CellRendererMixin from '@upfluence/hypertable/mixins/cell-renderer';

export default Component.extend(CellRendererMixin, {
  isCopied: false,

  endCopy() {
    this.set('isCopied', false);
  },

  copy: action(function (event) {
    event.stopPropagation();

    this.set('isCopied', true);

    navigator.clipboard.writeText(this.value);

    debounce(this, this.endCopy, 2500);
  })
});
