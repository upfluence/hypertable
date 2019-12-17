import Component from '@ember/component';

export default Component.extend({
  classNames: ['hypertable__facetting'],

  column: null,
  filteringKey: null,
  facets: [],

  actions: {
    toggleAppliedFacet(facet) {
      Ember.run.later(() => {
        this.column.applyFacets(
          this.filteringKey, this.facets.filterBy('applied', true)
        );
      }, 500)
    }
  }
});
