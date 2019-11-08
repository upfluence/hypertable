import SortableItem from 'ember-sortable/components/sortable-item';
import { computed, defineProperty, observer } from '@ember/object';
import { capitalize } from '@ember/string';
import { isEmpty } from '@ember/utils';

const AVAILABLE_RENDERERS = [
  'text', 'numeric', 'money', 'date', 'image', 'list'
];

export default SortableItem.extend({
  classNames: ['hypertable__column'],
  classNameBindings: [
    '_columnSize',
    '_orderingClass',
    '_ordered:hypertable__column--ordered',
    '_filtered:hypertable__column--filtered',

    'isText:hypertable__column--text',
    'isNumeric:hypertable__column--numeric',
    'isMoney:hypertable__column--numeric',
    'isImage:hypertable__column--image',
    'isList:hypertable__column--list',
  ],

  _ordered: false,
  _filtered: false,

  _columnSize: computed('column.size', function() {
    return `hypertable__column--size-${this.column.size}`;
  }),

  _orderingClass: computed('_ordered', 'column.orderDirection', function() {
    if (this._ordered) {
      return `hypertable__column--ordered-${this.column.orderDirection}`;
    }
  }),

  _filtersChanged: observer('column.filters.@each', function () {
    this.set('_filtered', !isEmpty(this.column.filters));
  }),

  _tableStateListener() {
    this.set('_ordered', !isEmpty(this.column.orderBy));
    this.set('_filtered', !isEmpty(this.column.filters));
  },

  didReceiveAttrs() {
    if (this.column) {
      if (!this.column.renderingComponent) {
        AVAILABLE_RENDERERS.forEach((rendererType) => {
          defineProperty(
            this,
            `is${capitalize(rendererType)}`,
            computed('column.type', function() {
              return this.column.type === rendererType;
            })
          );
        });
      }

      this.addObserver(
        'manager.columns.@each.orderBy',
        this,
        this._tableStateListener
      );

      this.set('_ordered', !isEmpty(this.column.orderBy));
      this.set('_filtered', !isEmpty(this.column.filters));
    }
  }
});
