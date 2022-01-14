import { tracked } from '@glimmer/tracking';
import { scheduleOnce } from '@ember/runloop';
import Tether from 'tether';

import {
  TableManager,
  RowsFetcher,
  Column,
  Filter,
  Row,
  OrderDirection,
  ColumnDefinition,
  RendererResolver
} from './interfaces';
import BaseRenderingResolver from './rendering-resolver';

export default class TableHandler {
  private _context: unknown;
  private _renderingResolver?: RendererResolver;
  private _lastOrderedColumn?: Column;

  tableManager: TableManager;
  rowsFetcher: RowsFetcher;
  tetherInstance?: Tether;

  @tracked tetherOn: string = '';
  @tracked columnDefinitions: ColumnDefinition[] = [];
  @tracked columns: Column[] = [];
  @tracked rows: Row[] = [];

  @tracked loadingColumns: boolean = false;
  @tracked loadingRows: boolean = false;

  currentPage: number = 1;

  constructor(emberContext: unknown, manager: TableManager, rowsFetcher: RowsFetcher, renderingResolver = undefined) {
    this._context = emberContext;
    this.tableManager = manager;
    this.rowsFetcher = rowsFetcher;
    this._renderingResolver = renderingResolver;
  }

  get renderingResolver(): RendererResolver {
    if (this._renderingResolver) {
      return this._renderingResolver;
    }

    return (this._renderingResolver = new BaseRenderingResolver(this._context));
  }

  async fetchColumns(): Promise<Column[]> {
    this.loadingColumns = true;

    return this.tableManager
      .fetchColumns()
      .then(({ columns }) => {
        this.columns = columns;
        return columns;
      })
      .finally(() => {
        this.loadingColumns = false;
      });
  }

  async fetchRows(): Promise<Row[]> {
    this.loadingRows = true;

    return this.rowsFetcher
      .fetch(this.currentPage, 20)
      .then(({ rows }) => {
        this.rows = rows;
        this.currentPage += 1;
        return rows;
      })
      .finally(() => {
        this.loadingRows = false;
      });
  }

  reorderColumns(columns: Column[]) {
    this.columns = columns;
    this.tableManager.upsertColumns({ columns: this.columns });
  }

  // @ts-ignore
  addColumn(definition: ColumnDefinition): Promise<any> {
    throw new Error('NotImplemented');
  }

  // @ts-ignore
  removeColumn(definition: ColumnDefinition): Promise<any> {
    throw new Error('NotImplemented');
  }

  /**
   * Set filters on a given column.
   *
   * @param {Column} column - The column on which to apply filters
   * @param {Filter[]} filters - The array of filters to apply to the column
   * @returns {Promise<any>}
   */
  async applyFilters(column: Column, filters: Filter[]): Promise<void> {
    column.filters = filters.reduce((acc, v) => {
      const filterWithSameKey = acc.find((filter) => filter.key === v.key);

      if (filterWithSameKey) {
        filterWithSameKey.value = v.value;
      } else {
        acc.push(v);
      }

      return acc;
    }, column.filters);

    return this.tableManager.upsertColumns({ columns: this.columns }).then(({ columns }) => {
      this._reinitColumnsAndRows(columns);
    });
  }

  /**
   * Apply ordering to a column
   *
   * @param {Column} column — The column we want to order by
   * @param {OrderDirection} direction — The direction we want to order the column in
   * @returns {Promise<any>}
   */
  async applyOrder(column: Column, direction: OrderDirection): Promise<void> {
    if (this._lastOrderedColumn) {
      this._lastOrderedColumn.order = undefined;
    }

    column.order = { key: column.definition.key, direction };

    return this.tableManager.upsertColumns({ columns: this.columns }).then(({ columns }) => {
      this._lastOrderedColumn = column;
      this._reinitColumnsAndRows(columns);
    });
  }

  /**
   * Reset columns' filters and order attributes
   *
   * @param {Column[]} columns — The columns we want to reset the state for.
   * @returns {Promise<any>}
   */
  async resetColumns(columns: Column[]): Promise<any> {
    columns.forEach((column) => {
      column.filters = [];
      column.order = undefined;
    });

    return this.tableManager.upsertColumns({ columns: this.columns }).then(({ columns }) => {
      this._reinitColumnsAndRows(columns);
    });
  }

  onBottomReached(): void {
    throw new Error('NotImplemented');
  }

  /**
   * Toggles an instance of Tether for a given column.
   *
   * @param {string} on - The column we want to create a Tether instance for
   * @param {Tether.ITetherOptions} options — Options that should be used for the Tether instance.
   */
  triggerTetherContainer(on: string, options: Tether.ITetherOptions): void {
    if (this.tetherOn !== on) {
      this.tetherOn = on;

      scheduleOnce('afterRender', this, () => {
        if (this.tetherInstance) {
          this.tetherInstance.setOptions(options);
        } else {
          this.tetherInstance = new Tether(options);
        }

        scheduleOnce('afterRender', this, () => {
          // @ts-ignore
          this.tetherInstance!.element.classList.add(`js--visible`);
        });
      });
    } else {
      this.tetherOn = '';
      this.destroyTetherInstance();
    }
  }

  /**
   * Destroy the current Tether instance if any.
   */
  destroyTetherInstance(): void {
    if (this.tetherInstance) {
      //@ts-ignore
      this.tetherInstance.element.remove();
      this.tetherInstance.destroy();
      this.tetherInstance = undefined;
      this.tetherOn = '';
    }
  }

  private _reinitColumnsAndRows(columns: Column[]) {
    this.columns = columns;
    this.currentPage = 1;
    this.fetchRows();
  }
}
