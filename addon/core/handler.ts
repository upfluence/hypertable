import { tracked } from '@glimmer/tracking';
import { set } from '@ember/object';
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
  RendererResolver,
  RowsFetcherMetadata
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
  @tracked loadingColumnDefinition: boolean = false;

  rowsMeta?: RowsFetcherMetadata;
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

  async fetchColumns(): Promise<void> {
    this.loadingColumns = true;

    return this.tableManager
      .fetchColumns()
      .then(({ columns }) => {
        this.columns = columns;
      })
      .finally(() => {
        this.loadingColumns = false;
      });
  }

  async fetchColumnDefinitions(): Promise<ColumnDefinition[]> {
    this.loadingColumnDefinition = true;

    return this.tableManager
      .fetchColumnDefinitions()
      .then(({ column_definitions }) => {
        this.columnDefinitions = column_definitions;
        return column_definitions;
      })
      .finally(() => {
        this.loadingColumnDefinition = false;
      });
  }

  async fetchRows(): Promise<Row[]> {
    this.loadingRows = true;

    return this.rowsFetcher
      .fetch(this.currentPage, 20)
      .then(({ rows, meta }) => {
        this.rows = [...this.rows, ...rows];
        this.rowsMeta = meta;
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

  addColumn(definition: ColumnDefinition): Promise<void> {
    return this.tableManager
      .upsertColumns({ columns: [...this.columns, ...[{ definition: definition, filters: [] }]] })
      .then((resp) => {
        this.columns = resp.columns;
        this.currentPage = 1;
        this.fetchRows();
      });
  }

  removeColumn(definition: ColumnDefinition): Promise<void> {
    return this.tableManager
      .upsertColumns({
        columns: this.columns.filter((column) => column.definition.key !== definition.key)
      })
      .then((resp) => {
        this.columns = resp.columns;
      });
  }

  /**
   * Set filters on a given column.
   *
   * @param {Column} column - The column on which to apply filters
   * @param {Filter[]} filters - The array of filters to apply to the column
   * @returns {Promise<void>}
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
   * @returns {Promise<void>}
   */
  async applyOrder(column: Column, direction: OrderDirection): Promise<void> {
    if (this._lastOrderedColumn) {
      this._lastOrderedColumn.order = undefined;
    }

    set(column, 'order', { key: column.definition.key, direction });

    return this.tableManager.upsertColumns({ columns: this.columns }).then(({ columns }) => {
      this._lastOrderedColumn = column;
      this._reinitColumnsAndRows(columns);
    });
  }

  /**
   * Reset columns' filters and order attributes
   *
   * @param {Column[]} columns — The columns we want to reset the state for.
   * @returns {Promise<void>}
   */
  async resetColumns(columns: Column[]): Promise<void> {
    columns.forEach((column) => {
      column.filters = [];
      set(column, 'order', undefined);
    });

    return this.tableManager.upsertColumns({ columns: this.columns }).then(({ columns }) => {
      this._reinitColumnsAndRows(columns);
    });
  }

  /**
   * Fetches more rows if there are any.
   *
   * @returns {void}
   */
  onBottomReached(): void {
    if (!this.rowsMeta || this.rowsMeta.total > this.rows.length) {
      this.fetchRows();
    }
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
          (<any>this.tetherInstance).element.classList.add(`js--visible`);
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

  private _reinitColumnsAndRows(columns: Column[]): void {
    this.columns = columns;
    this.currentPage = 1;
    this.fetchRows();
  }
}
