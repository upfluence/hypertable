import EmberObject, { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default EmberObject.extend({
  field: null,
  orderKey: null,
  orderBy: null,
  filters: [],
  type: 'text',
  size: 'M',
  renderingComponent: null,

  filterable: false,
  orderable: false,
  upsertable: false,

  orderDirection: computed('orderBy', function() {
    if (!this.orderBy) return;

    return this.orderBy.split(':')[1];
  }),

  addFilters(type, value) {
    if (isEmpty(this.filters)) {
      let f = EmberObject.create({ type, value })
      this.set('filters', [f]);
    } else {
      this.set('filters', this.filters.map((f) => {
        if (f.type === type) {
          f.set('value', value);
        }

        return f;
      }));
    }
  },

  clearFilters() {
    this.set('filters', []);
  }
});
