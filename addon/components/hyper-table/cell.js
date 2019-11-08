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

  _typeInferredRenderingComponent: computed('column.type', function() {
    if (AVAILABLE_RENDERERS.includes(this.column.type)) {
      return `hyper-table/cell-renderers/${this.column.type}`;
    }
  }),

  _renderingComponent: or(
    'column.renderingComponent', '_typeInferredRenderingComponent'
  ),

  click(e) {
    if (!this.header && this.onRowClicked) {
      if(this.item.editStatus === null) {
        this.onRowClicked(this.item);
      }
    }
  },

  actions: {
    onLiveEdit(data) {
      this.onLiveEdit(data);
    }
  }
});
