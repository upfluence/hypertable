import { ColumnDefinition, Column } from './column';

export type ColumnDefinitionResponse = {
  column_definitions: ColumnDefinition[];
};

export type TableColumnsResponse = {
  columns: Column[];
};

export type TableColumnUpsertRequest = {
  columns: Column[];
};

export type TableColumnUpsertResponse = {
  columns: Column[];
};

export interface TableManager {
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse>;
  fetchColumns(): Promise<TableColumnsResponse>;
  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse>;
}
