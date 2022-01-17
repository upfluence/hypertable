import {
  Column,
  ColumnDefinitionResponse,
  FieldSize,
  TableColumnsResponse,
  TableManager as ITableManager,
  TableColumnUpsertRequest,
  TableColumnUpsertResponse,
  ColumnDefinition
} from '@upfluence/hypertable/core/interfaces';

export const buildColumnDefinition = (
  key: string,
  size: FieldSize = FieldSize.Medium,
  filterable: boolean = false,
  orderable: boolean = false
): ColumnDefinition => {
  return {
    key,
    type: 'text',
    name: `Name: ${key}`,
    clustering_key: '',
    category: '',
    size: size,
    orderable: orderable,
    filterable: filterable,
    facetable: false
  };
};

export const buildColumn = (
  key: string,
  size: FieldSize = FieldSize.Medium,
  filterable: boolean = false,
  orderable: boolean = false
): Column => {
    console.log('=>') 
  return {
    definition: buildColumnDefinition(key, size, filterable, orderable),
    filters: []
  };
};

export default class TableManager implements ITableManager {
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse> {
    return Promise.resolve({ column_definitions: [] });
  }

  fetchColumns(): Promise<TableColumnsResponse> {
    return Promise.resolve({ columns: [buildColumn('foo'), buildColumn('bar', FieldSize.Large)] });
  }

  // @ts-ignore
  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse> {
    return Promise.resolve({ columns: request.columns });
  }
}
