import Component from '@ember/component';

export default Component.extend({
  classNames: ['hypertable__cell'],
  classNameBindings: [
    'item.selected:hypertable__cell--selected',
    'item.hovered:hypertable__cell--hovered',
    'loading:hypertable__cell--loading',
    'manager.hooks.onRowClicked:hypertable__cell--clickable'
  ],

  loading: false,
  renderingComponent: null,

  click(e) {
    if (this.manager.hooks.onRowClicked && (!this.manager.editStatus) || this.manager.get('editStatus.status') === 'success') {
      this.manager.hooks.onRowClicked(this.item);
    }
  },
});
