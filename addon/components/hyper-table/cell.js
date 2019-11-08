import Component from '@ember/component';
import { computed, defineProperty, observer } from '@ember/object';
import { and, or } from '@ember/object/computed';
import { capitalize } from '@ember/string';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';

const AVAILABLE_RENDERERS = [
  'text', 'numeric', 'money', 'date', 'image', 'list'
];

export default Component.extend({
  classNames: ['hypertable__cell'],
  classNameBindings: [
    'header:hypertable__cell--header',
    'item.selected:hypertable__cell--selected',
    'item.hovered:hypertable__cell--hovered',
    'loading:hypertable__cell--loading',
    'onRowClicked:hypertable__cell--clickable'
  ],

  header: false,
  selection: false,
  loading: false,

  _typeInferredRenderingComponent: computed('column.type', function() {
    if (AVAILABLE_RENDERERS.includes(this.column.type)) {
      return `hyper-table/cell-renderers/${this.column.type}`;
    }
  }),

  _renderingComponent: or(
    'column.renderingComponent', '_typeInferredRenderingComponent'
  ),

  _typeInferredFiltersRenderingComponent: computed('column.type', function() {
    if (AVAILABLE_RENDERERS.includes(this.column.type)) {
      return `hyper-table/filters-renderers/${this.column.type}`;
    }
  }),

  _filtersRenderingComponent: or(
    'column.filtersRenderingComponent', '_typeInferredFiltersRenderingComponent'
  ),

  _orderable: and('manager.options.features.ordering', 'column.orderable'),
  _filterable: and('manager.options.features.filtering', 'column.filterable'),
  _supportsOrderingOrFiltering: or('_orderable', '_filterable'),

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
    },

    toggleFiltersPanel() {
      if (this.manager.applyingFiltersOn !== this.column.key) {
        this.set('manager.applyingFiltersOn', this.column.key);

        if (document.querySelector('.available-filters')) {
          document.querySelector('.available-filters').remove();
        }

        run.later(() => {
          let tetherOptions = {
            element: `#${this.elementId} .available-filters`,
            target: `#${this.elementId}`,
            attachment: 'top center',
            targetAttachment: 'bottom left',
            offset: '-20px 0'
          };

          if (this.manager.tetherFilters) {
            this.manager.tetherFilters.setOptions(tetherOptions);
          } else {
            this.set('manager.tetherFilters', new Tether(tetherOptions));
          }

          document.querySelector('.available-filters').classList.add(
            'available-filters--visible'
          );
        });
      } else {
        this.set('manager.applyingFiltersOn', null);
        document.querySelector('.available-filters').remove()
        if (this.manager.tetherFilters) this.manager.tetherFilters.destroy();
      }
    },

    orderColumn() {
      if (this.header && this.manager.options.features.ordering && this.column.orderable) {
        let nextDirection = this.column.orderDirection === 'asc' ? 'desc' : 'asc';
        this.manager.updateOrdering(
          this.column, `${this.column.orderKey}:${nextDirection}`
        );
      }
    }
  }
});
