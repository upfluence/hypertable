import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

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
  @tracked appliedFacets: string[] = [];

  loadingFacetsRange = new Array(8);

  constructor(owner: unknown, args: FacetsLoaderArgs) {
    super(owner, args);

    this.loading = true;
    args.handler
      .fetchFacets('thread_holder', 'id')
      .then(({ facets }: FacetsResponse) => {
        this.facets = facets;

        if (isEmpty(args.column.filters.find((v) => v.key === 'id')?.value)) {
          this.appliedFacets = [];
        } else {
          this.appliedFacets = args.column.filters.find((v) => v.key === 'id')!.value.split(',');
        }
      })
      .finally(() => {
        this.loading = false;
        this.facets = [
          {
            identifier: 'mailing:2132',
            payload: {
              name: 'MEILLEUR MAILING AU MONDE'
            },
            count: 32
          },
          {
            identifier: 'mailing:14',
            payload: {
              name: 'dawda'
            },
            count: 16
          }
        ];

        if (isEmpty(args.column.filters.find((v) => v.key === 'id')?.value)) {
          this.appliedFacets = [];
        } else {
          this.appliedFacets = args.column.filters.find((v) => v.key === 'id')!.value.split(',');
        }
      });
  }

  @action
  toggleFacet(facet: Facet): void {
    if (this.appliedFacets.includes(facet.identifier)) {
      this.removeFacet(facet);
    } else {
      this.addFacet(facet);
    }
  }

  private addFacet(facet: Facet) {
    let facetFilter: Filter = { key: this.args.filteringKey, value: facet.identifier };
    const existingFilter = this.args.column.filters.find((filter) => filter.key === this.args.filteringKey);

    if (existingFilter) {
      facetFilter = { key: this.args.filteringKey, value: [existingFilter.value, facet.identifier].join(',') };
    }

    this.args.handler.applyFilters(this.args.column, [facetFilter]).then(() => {
      this.appliedFacets = [...this.appliedFacets, ...[facet.identifier]];
    });
  }

  private removeFacet(facet: Facet): void {
    const existingFilter = this.args.column.filters.find((filter) => filter.key === this.args.filteringKey);

    if (existingFilter) {
      let facetFilter;
      const applied = existingFilter.value.split(',');

      if (applied.length > 1) {
        facetFilter = { key: this.args.filteringKey, value: applied.filter((v) => v !== facet.identifier).join(',') };
      } else {
        facetFilter = { key: this.args.filteringKey, value: '' };
      }

      this.args.handler.applyFilters(this.args.column, [facetFilter]).then(() => {
        this.appliedFacets = this.appliedFacets.filter((x) => x !== facet.identifier);
      });
    }
  }
}
