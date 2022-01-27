import {
  Column,
  ColumnDefinitionResponse,
  FieldSize,
  Filter,
  TableColumnsResponse,
  TableManager as ITableManager,
  TableColumnUpsertRequest,
  TableColumnUpsertResponse,
  ColumnDefinition
} from '@upfluence/hypertable/core/interfaces';

export const buildColumnDefinition = (key: string, extra?: { [key: string]: any }): ColumnDefinition => {
  let defaultColumnDefinition = {
    key: key,
    type: 'text',
    name: `Name: ${key}`,
    clustering_key: '',
    category: '',
    size: FieldSize.Medium,
    orderable: false,
    filterable: false,
    facetable: false
  };

  return Object.assign(defaultColumnDefinition, extra || {});
};

export const buildColumn = (key: string, extra?: { [key: string]: any; filters?: Filter[] }): Column => {
  return {
    definition: buildColumnDefinition(key, extra || {}),
    filters: extra?.filters || []
  };
};

export default class TableManager implements ITableManager {
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse> {
    return Promise.resolve({ column_definitions: [] });
  }

  fetchColumns(): Promise<TableColumnsResponse> {
    return Promise.resolve({
      columns: [
        buildColumn('foo'),
        buildColumn('bar', { size: FieldSize.Large }),
        buildColumn('total', { type: 'integer' })
      ]
    });
  }

  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse> {
    return Promise.resolve({ columns: request.columns });
  }
}
