import { tracked } from '@glimmer/tracking';
import { TableManager, RowsFetcher, Column, Row, Order, ColumnDefinition } from './interfaces';

export default class TableHandler {
  tableManager: TableManager;
  rowsFetcher: RowsFetcher;
  renderingResolver? = null; 

  @tracked columnDefinitions: ColumnDefinition[] = [];
  @tracked columns: Column[] = [];
  @tracked rows: Row[] = [];

  constructor(manager: TableManager, rowsFetcher: RowsFetcher, renderingResolver = null) {
    this.tableManager = manager;
    this.rowsFetcher = rowsFetcher;
    this.renderingResolver = renderingResolver;
  }

  async fetchColumns(): Promise<Column[]> {
    return this.tableManager.fetchColumns().then(({ columns }) => {
      this.columns = columns;
      return columns;
    });
  }

  async fetchRows(): Row[] {
    this.rowsFetcher.fetch(1, 20).then((resp) => {
      this.rows = resp.rows;
      return resp.rows;
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
