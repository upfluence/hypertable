import EmberObject from '@ember/object';
import { isEmpty } from '@ember/utils';

export default EmberObject.extend({
  visible: true,
  sortKey: null,
  sortBy: null,
  filters: [],
  type: 'text',

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
