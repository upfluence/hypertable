import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { isEmpty } from '@ember/utils';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Facet, FacetsResponse, Filter } from '@upfluence/hypertable/core/interfaces';

interface FacetsLoaderArgs {
  handler: TableHandler;
  column: Column;
  filteringKey: string;
  searchEnabled: boolean;
}

const SEARCH_DEBOUNCE_TIME: number = 300;

export default class HyperTableV2FacetsLoader extends Component<FacetsLoaderArgs> {
  @tracked loading = false;
  @tracked facets: Facet[] = [];
  @tracked appliedFacets: string[] = [];
  @tracked searchQuery: string = '';

  loadingFacetsRange = new Array(8);

  constructor(owner: unknown, args: FacetsLoaderArgs) {
    super(owner, args);
    this.fetchFacets();
  }

  get searchEnabled(): boolean {
    return this.args.searchEnabled ?? false;
  }

  @action
  onInputChanged(): void {
    debounce(this, this.fetchFacets, SEARCH_DEBOUNCE_TIME);
  }

  @action
  onClearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchQuery = '';
    this.fetchFacets();
  }

  @action
  toggleFacet(facet: Facet): void {
    this.appliedFacets.includes(facet.identifier) ? this.removeFacet(facet) : this.addFacet(facet);
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

  private fetchFacets() {
    this.loading = true;
    this.args.handler
      .fetchFacets('thread_holder', 'id', this.searchQuery)
      .then(({ facets }: FacetsResponse) => {
        this.facets = facets;

        if (isEmpty(this.args.column.filters.find((v) => v.key === 'id')?.value)) {
          this.appliedFacets = [];
        } else {
          this.appliedFacets = this.args.column.filters.find((v) => v.key === 'id')!.value.split(',');
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
