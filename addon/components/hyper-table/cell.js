import Component from '@ember/component';
import { computed } from '@ember/object';
import { or } from '@ember/object/computed';

const AVAILABLE_RENDERERS = [
  'text', 'numeric', 'money', 'date', 'image', 'list'
];

export default Component.extend({
  classNames: ['hypertable__cell'],
  classNameBindings: [
    'item.selected:hypertable__cell--selected',
    'item.hovered:hypertable__cell--hovered',
    'loading:hypertable__cell--loading',
    'onRowClicked:hypertable__cell--clickable'
  ],

  loading: false,
  renderingComponent: null,

  click(e) {
    if (!this.header && this.manager.options.hooks.onRowClicked) {
      if(this.item.editStatus === null) {
        this.manager.options.hooks.onRowClicked(this.item);
      }
    }
  },
});
