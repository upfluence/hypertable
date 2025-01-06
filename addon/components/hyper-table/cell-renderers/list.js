import Component from '@ember/component';
import { computed } from '@ember/object';
import CellRendererMixin from '@upfluence/hypertable/mixins/cell-renderer';

export default Component.extend(CellRendererMixin, {
  length: computed('value.length', function () {
    return this.value.length - 1;
  }),

  isEditing: false,

  locked: computed('column.locked', function () {
    return this.column?.locked ?? true;
  }),

  formattedList: computed('value', 'value.firstObject.name', function () {
    if (this.value.firstObject.name) {
      return this.value.mapBy('name').join('<br>');
    }
    return this.value.slice().join('<br>');
  }),

  actions: {
    goToUrl(url, event) {
      if (!this.url) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      window.open(url, '_blank');
    },

    toggleList() {
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
    }
  }
});
