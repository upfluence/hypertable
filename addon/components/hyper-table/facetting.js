import Component from '@ember/component';
import { set } from '@ember/object';
import { later } from '@ember/runloop';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  classNames: ['hypertable__facetting'],
  classNameBindings: ['loading:hypertable__facetting--loading'],

  column: null,
  filteringKey: null,
  facets: [],

  loadingFacetsRange: new Array(8),

  actions: {
    toggleAppliedFacet(facet) {
      set(facet, 'applied', !facet.applied);

      if (this.onToggleAppliedFacet) {
        this.onToggleAppliedFacet(facet);
      }

      later(() => {
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
