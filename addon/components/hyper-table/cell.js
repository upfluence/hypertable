import Component from '@ember/component';

export default Component.extend({
  classNames: ['hypertable__cell'],
  classNameBindings: [
    'item.selected:hypertable__cell--selected',
    'item.hovered:hypertable__cell--hovered',
    'loading:hypertable__cell--loading',
    'manager.hooks.onRowClicked:hypertable__cell--clickable',
    'column.key'
  ],

  loading: false,
  renderingComponent: null,

  click(e) {
    let editStatus = this.manager.get('editStatus').filterBy('status', 'editing')

    if (this.manager.hooks.onRowClicked && editStatus.length === 0 && !this.selection)
      this.manager.hooks.onRowClicked(
        this.item.influencer_id, (this.column || {}).key
      );

      if (this.manager.availableFieldsPanel) {
        this.manager.toggleProperty('availableFieldsPanel');
      }
    },
});
