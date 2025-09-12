import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

import { IntlService } from 'ember-intl';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Facet, FacetsResponse, Filter } from '@upfluence/hypertable/core/interfaces';

interface FacetsLoaderArgs {
  handler: TableHandler;
  column: Column;
  facettingKey: string;
  searchEnabled: boolean;
  searchPlaceholder?: string;
  displaySearchLabel?: boolean;
  exclusive?: boolean;
  sortCompareFn?(a: Facet, b: Facet): number;
}

const SEARCH_DEBOUNCE_TIME: number = 300;
const FACET_APPLY_DEBOUNCE_TIME: number = 300;

export default class HyperTableV2FacetsLoader extends Component<FacetsLoaderArgs> {
  @service declare intl: IntlService;

  @tracked loading = false;
  @tracked facets: Facet[] = [];
  @tracked appliedFacets: string[] = [];
  @tracked searchQuery: string = '';
  @tracked ongoingFacetApply: boolean = false;

  declare filteringKey: string;

  loadingFacetsRange = new Array(8);

  constructor(owner: unknown, args: FacetsLoaderArgs) {
    super(owner, args);
    this.fetchFacets();

    args.handler.on('reset-columns', (columns) => {
      if (columns.includes(args.column)) {
        this.appliedFacets = [];
      }
    });
  }

  get searchEnabled(): boolean {
    return this.args.searchEnabled ?? false;
  }

  get displaySearchLabel(): boolean {
    return this.args.displaySearchLabel ?? true;
  }

  get searchPlaceholder(): string {
    return this.args.searchPlaceholder ?? this.intl.t('hypertable.column.filtering.search_term.placeholder');
  }

  get skeletonStyle(): string {
    return ['width: 100%', 'height: 10px'].join(';');
  }

  get facetsSorter(): (a: Facet, b: Facet) => number {
    return this.args.sortCompareFn ?? this.defaultSortCompareFn;
  }

  @action
  onInputChanged(value: string): void {
    this.searchQuery = value;

    debounce(this, this.fetchFacets, SEARCH_DEBOUNCE_TIME);
  }

  @action
  toggleFacet(facet: Facet): void {
    if (this.ongoingFacetApply) return;
    debounce(
      this,
      () => {
        this.appliedFacets.includes(facet.identifier) ? this.removeFacet(facet) : this.addFacet(facet);
      },
      facet,
      FACET_APPLY_DEBOUNCE_TIME
    );
  }

  private addFacet(facet: Facet): void {
    let facetFilter: Filter = { key: this.filteringKey, value: facet.identifier };
    const existingFilter = this.args.column.filters.find((filter) => filter.key === this.filteringKey);

    if (existingFilter && !this.args.exclusive) {
      facetFilter = { key: this.filteringKey, value: [existingFilter.value, facet.identifier].join(',') };
    }

    this.ongoingFacetApply = true;
    this.args.handler
      .applyFilters(this.args.column, [facetFilter])
      .then(() => {
        this.appliedFacets = [...(this.args.exclusive ? [] : this.appliedFacets), ...[facet.identifier]];
      })
      .finally(() => {
        this.ongoingFacetApply = false;
      });
  }

  private removeFacet(facet: Facet): Promise<void> {
    const existingFilter = this.args.column.filters.find((filter) => filter.key === this.filteringKey);

    if (existingFilter) {
      let facetFilter;
      const applied = existingFilter.value.split(',');

      if (applied.length > 1) {
        facetFilter = { key: this.filteringKey, value: applied.filter((v) => v !== facet.identifier).join(',') };
      } else {
        facetFilter = { key: this.filteringKey, value: '' };
      }

      this.ongoingFacetApply = true;
      return this.args.handler
        .applyFilters(this.args.column, [facetFilter])
        .then(() => {
          this.appliedFacets = this.appliedFacets.filter((x) => x !== facet.identifier);
        })
        .finally(() => {
          this.ongoingFacetApply = false;
        });
    }
    return Promise.resolve();
  }

  private fetchFacets(): void {
    this.loading = true;
    this.args.handler
      .fetchFacets(
        this.args.column.definition.key,
        this.args.column.definition.facetable_by?.[0] || 'value',
        this.searchQuery
      )
      .then(({ facets, filtering_key }: FacetsResponse) => {
        this.facets = (facets ?? []).sort(this.facetsSorter);
        this.filteringKey = filtering_key;

        const filterForKey = this.args.column.filters.find((v) => v.key === this.filteringKey);

        if (filterForKey && !isEmpty(filterForKey.value)) {
          this.appliedFacets = filterForKey.value.split(',');
        } else {
          this.appliedFacets = [];
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private defaultSortCompareFn(a: Facet, b: Facet): number {
    return (b.count ?? 0) - (a.count ?? 0);
  }
}
