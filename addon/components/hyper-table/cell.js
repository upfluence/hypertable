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

  click() {
    let editStatus = this.manager.get('editStatus').find((editStatus) => {
      return editStatus.status === 'editing' || editStatus.status === 'error';
    });

    let isAutosave = this.column && (this.column.autosave || this.column.field.autosave);

    if (this.manager.hooks.onRowClicked && !editStatus && !this.selection && !isAutosave)
      this.manager.hooks.onRowClicked(this.item, (this.column || {}).key);

    if (this.manager.availableFieldsPanel) {
      this.manager.toggleProperty('availableFieldsPanel');
    }

    if (this.manager.availableTableViews) {
      this.manager.toggleProperty('availableTableViews');
    }
  }
});
