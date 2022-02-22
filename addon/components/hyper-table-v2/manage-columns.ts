import { A } from '@ember/array';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import TableHandler from '@upfluence/hypertable/core/handler';
import { ColumnDefinition } from '@upfluence/hypertable/core/interfaces';

type ManagedColumn = {
  definition: ColumnDefinition;
  visible: boolean;
};

interface HyperTableV2ManageColumnsArgs {
  handler: TableHandler;
  didInsertColumn(): void;
}

export default class HyperTableV2ManageColumns extends Component<HyperTableV2ManageColumnsArgs> {
  @tracked displayAvailableFields: boolean = false;
  @tracked _activeColumnCategory: null | string = null;
  @tracked _searchColumnDefinitionKeyword: null | string = null;

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

  get _orderedFilteredClusters(): Map<string, ManagedColumn[]> {
    let fields = A(
      (this.args.handler.columnDefinitions || []).filter((columnDefinition) => {
        const search = (this._searchColumnDefinitionKeyword || '').toLowerCase();
        const hasSearched =
          !this._searchColumnDefinitionKeyword || columnDefinition.name.toLowerCase().indexOf(search) >= 0;
        const hasActiveGroup = !this._activeColumnCategory || columnDefinition.category === this._activeColumnCategory;
        return hasActiveGroup && hasSearched;
      })
    ).sortBy('name');

    return this.groupByClusteringKey(fields);
  }

  groupByClusteringKey(columnDefinitions: ColumnDefinition[]): Map<string, ManagedColumn[]> {
    const map = new Map();

    columnDefinitions.forEach((columnDefinition) => {
      if (
        this.args.handler.columns.length > 0 &&
        this.args.handler.columns[0].definition.name === columnDefinition.name
      ) {
        return;
      }
      const cluster = map.get(columnDefinition.clustering_key);
      const manageColumn: ManagedColumn = {
        definition: columnDefinition,
        visible: !isEmpty(this.args.handler.columns.find((column) => column?.definition.key === columnDefinition.key))
      };

      if (!cluster) {
        map.set(columnDefinition.clustering_key, [manageColumn]);
      } else {
        cluster.push(manageColumn);
      }
    });

    return new Map([...map].sort((a, b) => a[0].localeCompare(b[0])));
  }

  @action
  columnVisibilityUpdate(column: ManagedColumn, event: PointerEvent): void {
    event.stopPropagation();
    if (column.visible) {
      console.log('handler removeColumn');
      this.args.handler.removeColumn(column.definition);
    } else {
      this.args.handler.addColumn(column.definition).then(() => {
        this.args.didInsertColumn?.();
      });
    }
  }

  @action
  setFieldCategory(category: string): void {
    this._activeColumnCategory = category;
  }

  @action
  toggleAvailableFields(): void {
    this.displayAvailableFields = !this.displayAvailableFields;
  }

  @action
  closeAvailableFields(): void {
    this.displayAvailableFields = false;
  }
}
