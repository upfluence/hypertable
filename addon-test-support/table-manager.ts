import {
  Column,
  ColumnDefinitionResponse,
  FieldSize,
  TableColumnsResponse,
  TableManager as ITableManager,
  TableColumnUpsertRequest,
  TableColumnUpsertResponse
} from '@upfluence/hypertable/core/interfaces';

const buildColumn = (key: string): Column => {
  const def = {
    key,
    type: 'text',
    name: `Name: ${key}`,
    clustering_key: '',
    category: '',
    size: FieldSize.Medium,
    orderable: false,
    filterable: false,
    facetable: false
  };

  return {
    definition: def,
    filters: []
  };
};

export default class TableManager implements ITableManager {
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse> {
    return Promise.resolve({ column_definitions: [] });
  }

  fetchColumns(): Promise<TableColumnsResponse> {
    return Promise.resolve({ columns: [buildColumn('foo'), buildColumn('bar')] });
  }

  // @ts-ignore
  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse> {
    return Promise.resolve({ columns: [buildColumn('foo'), buildColumn('bar')] });
  }
}
