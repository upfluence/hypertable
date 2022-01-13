import { A } from '@ember/array';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import TableHandler from '@upfluence/hypertable/core/handler';
import { ColumnDefinition } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2ManageFieldsArgs {
  handler: TableHandler;
}

export default class HyperTableV2ManageFields extends Component<HyperTableV2ManageFieldsArgs> {
  @tracked displayAvailableFields: boolean = false;
  @tracked _activeColumnCategory: null | string = null;

  get _columnCategories(): string[] {
    return this.args.handler.columnDefinitions
      .reduce((categories: string[], columnDefinition) => {
        if (!categories.includes(columnDefinition.category)) {
          categories.push(columnDefinition.category);
        }
        return categories;
      }, [])
      .sort((a, b) => a.localeCompare(b));
  }

  get _orderedFilteredClusters() {
    let fields = A(
      this.args.handler.columnDefinitions.filter((columnDefinition) => {
        const hasActiveGroup = columnDefinition.category === this._activeColumnCategory;
        return hasActiveGroup;
      })
    ).sortBy('name');
    return this.groupByClusteringKey(fields);
  }

  groupByClusteringKey(columnDefinitions: ColumnDefinition[]) {
    const map = new Map();

    columnDefinitions.forEach((columnDefinition) => {
      const cluster = map.get(columnDefinition.clustering_key);

      if (!cluster) {
        map.set(columnDefinition.clustering_key, [columnDefinition]);
      } else {
        cluster.push(columnDefinition);
      }
    });

    return map;
  }

  @action
  setFieldCategory(category: string): void {
    this._activeColumnCategory = category;
  }

  @action
  openAvailableFields(): void {
    this.displayAvailableFields = true;
  }

  @action
  closeAvailableFields(): void {
    this.displayAvailableFields = false;
  }
}
