import { tracked } from '@glimmer/tracking';
import { TableManager, RowsFetcher, Column, Row, Order, ColumnDefinition, RendererResolver } from './interfaces';
import BaseRenderingResolver from './rendering-resolver';

export default class TableHandler {
  private _context: unknown;
  private _renderingResolver?: RendererResolver;
  tableManager: TableManager;
  rowsFetcher: RowsFetcher;

  @tracked columnDefinitions: ColumnDefinition[] = [];
  @tracked columns: Column[] = [];
  @tracked rows: Row[] = [];

  @tracked loadingColumns: boolean = false;
  @tracked loadingRows: boolean = false;

  currentPage: number = 1;

  constructor(
    emberContext: unknown,
    manager: TableManager,
    rowsFetcher: RowsFetcher,
    renderingResolver = undefined
  ) {
    this._context = emberContext;
    this.tableManager = manager;
    this.rowsFetcher = rowsFetcher;
    this._renderingResolver = renderingResolver
  }

  get renderingResolver(): RendererResolver {
    if (this._renderingResolver) {
      return this._renderingResolver;
    }

    return (this._renderingResolver = new BaseRenderingResolver(this._context))
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

  // @ts-ignore
  applyFilters(column: Column, filters: Filter[]): Promise<any> {
    throw new Error('NotImplemented');
  }

  // @ts-ignore
  applyOrder(column: Column, order: Order): Promise<any> {
    throw new Error('NotImplemented');
  }

  // @ts-ignore
  resetColumns(): Promise<any> {
    throw new Error('NotImplemented');
  }

  // @ts-ignore
  onBottomReached(): void {
    throw new Error('NotImplemented');
  }
}
