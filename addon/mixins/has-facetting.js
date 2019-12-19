import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { isEmpty } from '@ember/utils';

export default Mixin.create({
  _facetSearchKeyword: null,

  availableFacets: computed('facets', '_facetSearchKeyword', function() {
    if (!this._facetSearchKeyword || isEmpty(this._facetSearchKeyword)) {
      return this.facets;
    }

    let _keyword = this._facetSearchKeyword.toLowerCase()

    return this.facets.filter((x) => {
      return x.formattedIdentifier.toLowerCase().indexOf(_keyword) >= 0;
    });
  })
});
