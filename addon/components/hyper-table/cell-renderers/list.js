import Component from '@ember/component';
import { action, computed } from '@ember/object';

import CellRendererMixin from '@upfluence/hypertable/mixins/cell-renderer';

export default Component.extend(CellRendererMixin, {
  length: computed('value.length', function () {
    return this.value.length - 1;
  }),

  isEditing: false,

  firstItem: computed('value.[]', function () {
    return this.value.slice()[0];
  }),

  formattedList: computed('value.[]', 'firstItem.name', function () {
    if (this.firstItem.name) {
      return this.value.map((item) => item.name).join('<br>');
    }
    return this.value.slice().join('<br>');
  }),

  goToUrl: action(function (url, locked, event) {
    if (!this.url || locked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    window.open(url, '_blank');
  }),

  toggleList: action(function (event) {
    event.stopPropagation();

    if (this.manager.tetherOn !== this.elementId) {
      this.manager.destroyTetherInstance();
    }

    this.manager.triggerTetherContainer(
      this.elementId,
      'expandable-list',
      {
        element: `#${this.elementId} .expandable-list`,
        target: `#${this.elementId} .list-container`,
        attachment: 'top center',
        targetAttachment: 'bottom center',
        constraints: [
          {
            to: 'scrollParent'
          }
        ]
      },
      false,
      document.querySelector(`#${this.elementId} .list-container`).offsetWidth
    );
  })
});
