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

export const buildColumnDefinition = (key: string, size = FieldSize.Medium): ColumnDefinition => {
  return {
    key,
    type: 'text',
    name: `Name: ${key}`,
    clustering_key: '',
    category: '',
    size: size,
    orderable: false,
    filterable: false,
    facetable: false
  };
};

export const buildColumn = (key: string, size = FieldSize.Medium): Column => {
  return {
    definition: buildColumnDefinition(key, size),
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
