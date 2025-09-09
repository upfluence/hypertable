import { A } from '@ember/array';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { set } from '@ember/object';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import TableHandler from '@upfluence/hypertable/core/handler';
import { ColumnDefinition } from '@upfluence/hypertable/core/interfaces';
import { later, next } from '@ember/runloop';

type ManagedColumn = {
  definition: ColumnDefinition;
  visible: boolean;
  isLoading: boolean;
};

interface HyperTableV2ManageColumnsArgs {
  handler: TableHandler;
  didInsertColumn(): void;
}

export default class HyperTableV2ManageColumns extends Component<HyperTableV2ManageColumnsArgs> {
  @tracked displayAvailableFields: boolean = false;
  @tracked activeColumnCategory: null | string = null;
  @tracked searchColumnDefinitionKeyword: null | string = null;
  @tracked dropdownVisibility: 'visible' | 'invisible' = 'invisible';

  get _columnCategories(): string[] {
    return (this.args.handler.columnDefinitions || [])
      .reduce((categories: string[], columnDefinition) => {
        if (!isEmpty(columnDefinition.category) && !categories.includes(columnDefinition.category)) {
          categories.push(columnDefinition.category);
        }
        return categories;
      }, [])
      .sort((a, b) => a.localeCompare(b));
  }

  get orderedFilteredClusters(): Map<string, ManagedColumn[]> {
    let fields = A(
      (this.args.handler.columnDefinitions || []).filter((columnDefinition) => {
        const search = (this.searchColumnDefinitionKeyword || '').toLowerCase();
        const hasSearched =
          !this.searchColumnDefinitionKeyword || columnDefinition.name.toLowerCase().indexOf(search) >= 0;
        const hasActiveGroup = !this.activeColumnCategory || columnDefinition.category === this.activeColumnCategory;
        return hasActiveGroup && hasSearched;
      })
    ).sortBy('name');

    return this.groupByClusteringKey(fields);
  }

  groupByClusteringKey(columnDefinitions: ColumnDefinition[]): Map<string, ManagedColumn[]> {
    const map = new Map();

    columnDefinitions.forEach((columnDefinition) => {
      if (this.args.handler.columns.length > 0 && columnDefinition.position?.sticky) {
        return;
      }
      const key = columnDefinition.clustering_key === 'twitter' ? 'x' : columnDefinition.clustering_key;
      const cluster = map.get(key);
      const manageColumn: ManagedColumn = {
        definition: columnDefinition,
        visible: !isEmpty(this.args.handler.columns.find((column) => column?.definition.key === columnDefinition.key)),
        isLoading: false
      };

      if (!cluster) {
        map.set(key, [manageColumn]);
      } else {
        cluster.push(manageColumn);
      }
    });

    return new Map([...map].sort((a, b) => a[0].localeCompare(b[0])));
  }

  noop(event: Event) {
    event.preventDefault();
  }

  @action
  columnVisibilityUpdate(column: ManagedColumn, event: PointerEvent): void {
    set(column, 'isLoading', true);
    event?.stopPropagation?.();
    if (column.visible) {
      this.args.handler.removeColumn(column.definition).then(() => {
        set(column, 'isLoading', false);
      });
    } else {
      this.args.handler.addColumn(column.definition).then(() => {
        set(column, 'isLoading', false);
        this.args.didInsertColumn?.();
      });
    }
  }

  @action
  setFieldCategory(category: string): void {
    this.activeColumnCategory = category;
  }

  @action
  toggleAvailableFields(): void {
    if (this.displayAvailableFields) {
      this.closeAvailableFields();
    } else {
      this.displayAvailableFields = true;
      next(this, () => {
        this.dropdownVisibility = 'visible';
      });
    }
  }

  @action
  closeAvailableFields(): void {
    this.dropdownVisibility = 'invisible';
    later(
      this,
      () => {
        this.displayAvailableFields = false;
      },
      300
    );
  }

  @action
  onSearchUpdate(value: string): void {
    this.searchColumnDefinitionKeyword = value;
  }
}
