import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';

export default Component.extend({
  classNames: ['hypertable__facetting'],
  classNameBindings: ['loading:hypertable__facetting--loading'],

  column: null,
  filteringKey: null,
  facets: [],

  loadingFacetsRange: new Array(8),

  actions: {
    toggleAppliedFacet(facet) {
      if (this.onToggleAppliedFacet) {
        this.onToggleAppliedFacet(facet);
      }

      run.later(() => {
        this.column.applyFacets(
          this.filteringKey,
          this.facets.filter((f) => {
            return f.applied && !isEmpty(f.identifier);
          })
        );
      }, 500);
    }
  }
});
