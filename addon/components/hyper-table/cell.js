import Component from '@ember/component';

export default Component.extend({
  classNames: ['hypertable__cell'],
  classNameBindings: [
    'item.selected:hypertable__cell--selected',
    'item.hovered:hypertable__cell--hovered',
    'item.deleted:hypertable__cell--deleted',
    'loading:hypertable__cell--loading',
    'manager.hooks.onRowClicked:hypertable__cell--clickable',
    'column.key'
  ],

  loading: false,
  renderingComponent: null,

  click(e) {
    let editStatus = this.manager.get('editStatus').find((editStatus) => {
      return editStatus.status === 'editing' || editStatus.status === 'error';
    });
    if (this.manager.hooks.onRowClicked && !editStatus && !this.selection && this.column.key !== 'rating')
      this.manager.hooks.onRowClicked(
        this.item.influencer_id, (this.column || {}).key
      );

      if (this.manager.availableFieldsPanel) {
        this.manager.toggleProperty('availableFieldsPanel');
      }
    },
});
