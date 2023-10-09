import { tracked } from '@glimmer/tracking';
import { set } from '@ember/object';
import { addListener, sendEvent } from '@ember/object/events';
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
  RowsFetcherMetadata,
  FacetsResponse
} from './interfaces';
import BaseRenderingResolver from './rendering-resolver';
import { isEmpty } from '@ember/utils';

export type RowMutator = (row: Row) => boolean;

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
  @tracked selection: Row[] | 'all' = [];
  @tracked exclusion: Row[] = [];

  @tracked loadingColumns: boolean = true;
  @tracked loadingRows: boolean = true;
  @tracked communicationError: boolean = false;
  @tracked loadingColumnDefinition: boolean = true;
  @tracked rowsMeta?: RowsFetcherMetadata;

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
      .catch(() => {
        this.communicationError = true;
      })
      .finally(() => {
        this.loadingColumns = false;
      });
  }

  async fetchColumnDefinitions(): Promise<void> {
    this.loadingColumnDefinition = true;

    return this.tableManager
      .fetchColumnDefinitions()
      .then(({ column_definitions }) => {
        this.columnDefinitions = column_definitions;
      })
      .catch(() => {
        this.communicationError = true;
      })
      .finally(() => {
        this.loadingColumnDefinition = false;
      });
  }

  async fetchRows(): Promise<void> {
    this.loadingRows = true;

    return this.rowsFetcher
      .fetch(this.currentPage, 20)
      .then(({ rows, meta }) => {
        this.rows = [...this.rows, ...rows];
        this.rowsMeta = meta;
        this.currentPage += 1;
      })
      .catch(() => {
        this.communicationError = true;
      })
      .finally(() => {
        this.loadingRows = false;
      });
  }

  async updateRowById(recordId: number): Promise<void> {
    if (!this.rowsFetcher.fetchById) {
      throw new Error('[Hypertable/Handler] The RowsFetcher in use does not support fetchById.');
    }

    return this.rowsFetcher.fetchById(recordId).then((updatedRow: Row) => {
      this.mutateRow(recordId, (row) => {
        Object.keys(updatedRow).forEach((key) => {
          set(row, key, updatedRow[key]);
        })
        return true;
      })
    })
  }

  reorderColumns(columns: Column[]) {
    this.columns = columns;
    this.tableManager.upsertColumns({ columns: this.columns });
  }

  /**
   * Trigger an event
   *
   * @param {string} event
   * @param {any[]} args
   */
  triggerEvent(event: string, ...args: any[]) {
    sendEvent(this, event, args);
  }

  /**
   * Attach a handler to a specific event in the handler's lifecycle.
   *
   * @param {string} event — The event to subscribe to.
   * @param {Function} handler - A callback function to be called when the subscribed event is triggered.
   * @returns {TableHandler}
   */
  on(event: string, handler: (...args: any[]) => any): TableHandler {
    // @ts-ignore Works but the declaration from @types/ember__object does not match the documentation/actual code.
    addListener(this, event, handler);

    return this;
  }

  /**
   * Add a column to the table.
   *
   * @param {ColumnDefinition} definition - The column definition we want to add to the table
   * @returns {Promise<void>}
   */
  async addColumn(definition: ColumnDefinition): Promise<void> {
    return this.tableManager
      .upsertColumns({ columns: [...this.columns, ...[{ definition: definition, filters: [] }]] })
      .then(({ columns }) => {
        this._reinitColumnsAndRows(columns);
      });
  }

  /**
   * Remove a column from the table.
   *
   * @param {ColumnDefinition} definition - The column definition we want to remove from the table
   * @returns {Promise<void>}
   */
  async removeColumn(definition: ColumnDefinition): Promise<void> {
    const columnToRemove = this.columns.filter((column) => column.definition.key === definition.key);
    return this.tableManager
      .upsertColumns({
        columns: this.columns.filter((column) => column.definition.key !== definition.key)
      })
      .then(({ columns }) => {
        this.columns = columns;
        if (columnToRemove.length > 0 && columnToRemove[0].filters.length > 0) {
          this._reinitColumnsAndRows(columns);
          this.triggerEvent('remove-column');
        }
      });
  }

  /**
   * Remove a row by its record id.
   *
   * @param {number} recordId - The record id of the row
   * @returns {void}
   */
  removeRow(recordId: number): void {
    this.rows = this.rows.filter((row) => row.record_id !== recordId);
    this.triggerEvent('remove-row');
  }

  /**
   * Updates a row by its record id.
   *
   * @param {number} recordId - The record id of the row
   * @param {RowMutator} changeRow - The chagne to apply to the row, returns true if the table has to be redrawn.
   * @returns {boolean} true if the table has been redrawn.
   */
  mutateRow(recordId: number, changeRow: RowMutator): boolean {
    const shouldRefresh = this.rows
      .filter((row: Row) => row.record_id === recordId)
      .map(changeRow)
      .reduce((previousValue, currentValue) => previousValue || currentValue, false);

    // Triggers the redraw of the table.
    if (shouldRefresh) {
      this.rows = this.rows;
      this.triggerEvent('mutate-rows');
    }

    return shouldRefresh;
  }

  /**
   * Fetch facets for a given columns to hint filtering.
   *
   * @param {string} columnKey — The key of the column to fetch facets for.
   * @param {string} filteringKey — The attribute by which we want to hint by.
   * @returns {Promise<FacetsResponse>}
   */
  async fetchFacets(columnKey: string, filteringKey: string, searchValue?: string): Promise<FacetsResponse> {
    if (!this.tableManager.fetchFacets) {
      throw new Error('[Hypertable/Handler] The TableManager in use does not support facetting.');
    }

    return this.tableManager.fetchFacets(columnKey, filteringKey, searchValue);
  }

  /**
   * Set filters on a given column.
   *
   * @param {Column} column - The column on which to apply filters
   * @param {Filter[]} filters - The array of filters to apply to the column
   * @returns {Promise<void>}
   */
  async applyFilters(column: Column, filters: Filter[]): Promise<void> {
    set(
      column,
      'filters',
      filters
        .reduce((acc, v) => {
          const filterWithSameKey = acc.find((filter) => filter.key === v.key);

          if (filterWithSameKey) {
            filterWithSameKey.value = v.value;
          } else {
            acc.push(v);
          }

          return acc;
        }, column.filters)
        .filter((f) => !isEmpty(f.key) && !isEmpty(f.value))
    );

    return this.tableManager.upsertColumns({ columns: this.columns }).then(({ columns }) => {
      this._reinitColumnsAndRows(columns);
      this.triggerEvent('apply-filters', column, filters);
    });
  }

  /**
   * Apply ordering to a column
   *
   * @param {Column} column — The column we want to order by
   * @param {OrderDirection} direction — The direction we want to order the column in
   * @returns {Promise<void>}
   */
  async applyOrder(column: Column, direction: OrderDirection): Promise<void> {
    if (this._lastOrderedColumn && this._lastOrderedColumn !== column) {
      set(this._lastOrderedColumn, 'order', undefined);
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
  async resetColumns(columnsToReset: Column[]): Promise<void> {
    columnsToReset.forEach((column) => {
      set(column, 'filters', []);
      set(column, 'order', undefined);
    });

    return this.tableManager.upsertColumns({ columns: this.columns }).then(({ columns }) => {
      this._reinitColumnsAndRows(columns);
      this.triggerEvent('reset-columns', columnsToReset);
    });
  }

  /**
   * Reset rows
   *
   * @returns {Promise<void>}
   */
  async resetRows(): Promise<void> {
    this.rows = [];
    this.currentPage = 1;
    return this.fetchRows().then(() => {
      this.triggerEvent('reset-rows');
    });
  }

  /**
   * Fetches more rows if there are any.
   *
   * @returns {void}
   */
  onBottomReached(): void {
    if (!this.loadingRows && (!this.rowsMeta || this.rowsMeta.total > this.rows.length)) {
      this.fetchRows();
    }
  }

  /**
   * Toggle the selection state between loaded and all rows.
   *
   * @param {boolean} toggled
   */
  toggleSelectAll(toggled: boolean): void {
    if (toggled) {
      if (this.rowsMeta?.total === this.rows.length) {
        this.selection = 'all';
      } else {
        this.selection = this.rows;
      }
    } else {
      this.clearSelection();
    }
  }

  /**
   * Update the selection state of all rows and clean exclusion rows array
   *
   * @returns {void}
   */
  selectAllGlobal(): void {
    this.selection = 'all';
    this.exclusion = [];
  }

  /**
   * Clean selection and exclusion rows arrays
   *
   * @returns {void}
   */
  clearSelection(): void {
    this.selection = [];
    this.exclusion = [];
  }

  /**
   * Add or remove a row to the selected items depending on whether it's already present or not.
   *
   * @param {Row} row
   */
  updateSelection(row: Row): void {
    this.selection = this.selection instanceof Array ? this.selection : [];

    if (this.selection.includes(row)) {
      this.selection = this.selection.filter((selectedRow: Row) => selectedRow !== row);
    } else {
      this.selection = [...this.selection, row];
      if (this.selection.length === this.rowsMeta?.total) {
        this.selection = 'all';
      }
    }
  }

  /**
   * Add or remove a row to the excluded items depending on whether it's already present or not.
   *
   * @param {Row} row
   */
  updateExclusion(row: Row): void {
    if (this.exclusion.includes(row)) {
      this.exclusion = this.exclusion.filter((excludedRow: Row) => excludedRow !== row);
    } else {
      this.exclusion = [...this.exclusion, row];
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
   * Get the current position of the column
   */
  columnPosition(column: Column): number {
    return this.columns.indexOf(column);
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
    let shouldRedraw = false;
    columns.forEach((column) => {
      let existingColumn = this.columns.find((c) => c.definition.key === column.definition.key);

      if (!existingColumn) {
        this.columns.splice(columns.indexOf(column), 0, column);
        shouldRedraw = true;
      }
    });
    if (shouldRedraw) {
      this.columns = this.columns;
    }

    this.rows = [];
    this.currentPage = 1;
    this.fetchRows();
  }
}
