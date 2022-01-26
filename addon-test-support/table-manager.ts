import {
  Column,
  ColumnDefinitionResponse,
  FieldSize,
  Filter,
  TableColumnsResponse,
  FacetsResponse,
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
    return Promise.resolve({ columns: [buildColumn('foo'), buildColumn('bar', { size: FieldSize.Large })] });
  }

  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse> {
    return Promise.resolve({ columns: request.columns });
  }

  fetchFacets(_key: string, filteringKey: string): Promise<FacetsResponse> {
    return Promise.resolve({
      facets: [{
        identifier: 'band:1',
        payload: {
          name: 'The Foo Fighters'
        },
        count: 4
      }],
      filtering_key: filteringKey
    })
  }
}
