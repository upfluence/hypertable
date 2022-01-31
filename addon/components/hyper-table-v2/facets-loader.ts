import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Facet, FacetsResponse, Filter } from '@upfluence/hypertable/core/interfaces';

interface FacetsLoaderArgs {
  handler: TableHandler;
  column: Column;
  filteringKey: string;
}

export default class HyperTableV2FacetsLoader extends Component<FacetsLoaderArgs> {
  @tracked loading = false;
  @tracked facets: Facet[] = [];

  loadingFacetsRange = new Array(8);
  appliedFacets: Facet[] = [];

  constructor(owner: unknown, args: FacetsLoaderArgs) {
    super(owner, args);

    this.loading = true;
    args.handler
      .fetchFacets(args.column.definition.key, args.filteringKey)
      .then(({ facets, filtering_key }: FacetsResponse) => {
        console.log(facets, filtering_key);
        //this.facets = facets;
        //this.filteringKey = filtering_key;
      })
      .finally(() => {
        this.loading = false;
        this.facets = [
          {
            identifier: 'replied',
            payload: {
              status: 'replied'
            },
            count: 40
          },
          {
            identifier: 'sent',
            payload: {
              status: 'sent'
            },
            count: 27
          }
        ];
      });
  }

  @action
  toggleFacet(facet: Facet) {
    this.appliedFacets.includes(facet) ? this.removeFacet(facet) : this.addFacet(facet);
  }

  private addFacet(facet: Facet) {
    let facetFilter: Filter = { key: this.args.filteringKey, value: facet.identifier };
    const existingFilter = this.args.column.filters.find((filter) => filter.key === this.args.filteringKey);

    if (existingFilter) {
      facetFilter = { key: this.args.filteringKey, value: [existingFilter.value, facet.identifier].join(',') };
    }

    this.args.handler.applyFilters(this.args.column, [facetFilter]);
  }

  private removeFacet(facet: Facet) {
/*    let facetFilter;*/
    /*const existingFilter = this.args.column.filters.find((filter) => filter.key === this.args.filteringKey);*/

    /*if (existingFilter) {*/
    /*//existingFilter.value.spit(',')*/
      /*facetFilter = { key: this.args.filteringKey, value: [existingFilter.value, facet.identifier].join(',') };*/
    /*}*/

    /*this.args.handler.applyFilters(this.args.column, [facetFilter]);*/
  }
}

//export default Component.extend({
//classNames: ['hypertable__facetting'],
//classNameBindings: ['loading:hypertable__facetting--loading'],

//column: null,
//filteringKey: null,
//facets: [],

//loadingFacetsRange: new Array(8),

//actions: {
//toggleAppliedFacet(facet) {
//if (this.onToggleAppliedFacet) {
//this.onToggleAppliedFacet(facet);
//}

//run.later(() => {
//this.column.applyFacets(
//this.filteringKey,
//this.facets.filter((f) => {
//return f.applied && !isEmpty(f.identifier);
//})
//);
//}, 500);
//}
//}
//});
