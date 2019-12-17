import Component from '@ember/component';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  classNames: ['hypertable__facetting'],

  column: null,
  filteringKey: null,
  facets: [],

  actions: {
    toggleAppliedFacet(facet) {
      Ember.run.later(() => {
        this.column.applyFacets(
          this.filteringKey, this.facets.filter((f) => {
            return f.applied && !isEmpty(f.identifier);
          })
        );
      }, 500)
    }
  }
});
