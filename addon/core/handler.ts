import { tracked } from '@glimmer/tracking';
import { TableManager, RowsFetcher, Column, Row, Order, ColumnDefinition } from './interfaces';

export default class TableHandler {
  tableManager: TableManager;
  rowsFetcher: RowsFetcher;
  renderingResolver? = null;

  @tracked columnDefinitions: ColumnDefinition[] = [];
  @tracked columns: Column[] = [];
  @tracked rows: Row[] = [];

  @tracked loadingColumns: boolean = false;
  @tracked loadingRows: boolean = false;

  nextPage: number = 1;

  constructor(manager: TableManager, rowsFetcher: RowsFetcher, renderingResolver = null) {
    this.tableManager = manager;
    this.rowsFetcher = rowsFetcher;
    this.renderingResolver = renderingResolver;
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
        this.loadingColumns = true;
      });
  }

  async fetchRows(): Promise<Row[]> {
    this.loadingRows = true;

    return this.rowsFetcher
      .fetch(this.nextPage, 20)
      .then((resp) => {
        this.rows = resp.rows;
        this.nextPage += 1;
        return resp.rows;
      })
      .finally(() => {
        this.loadingRows = false;
      });
  }

  reorderColumns(columns: Column[]) {
    this.columns = columns;
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
