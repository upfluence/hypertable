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

export type Facet = {
  identifier: string;
  payload: { [key: string]: any };
  count?: number;
};

export type FacetsResponse = {
  facets: Facet[];
  filtering_key: string;
};

export interface TableManager {
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse>;
  fetchColumns(): Promise<TableColumnsResponse>;
  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse>;
  fetchFacets?(column_key: string, filtering_key: string): Promise<FacetsResponse>;
}
