import Controller from '@ember/controller';

import TableHandler from '@upfluence/hypertable/core/handler';
import {
  Column,
  ColumnDefinition,
  ColumnDefinitionResponse,
  TableColumnUpsertRequest,
  TableColumnUpsertResponse,
  FieldSize,
  TableManager,
  TableColumnsResponse
} from '@upfluence/hypertable/core/interfaces';

const columnDefinitions = [
  { key: 'foo', category: 'influencer', clusteringKey: 'instagram' },
  { key: 'bar', category: 'influencer', clusteringKey: 'youtube' },
  { key: 'code', category: 'affiliation', clusteringKey: '' },
  { key: 'toto', category: 'influencer', clusteringKey: 'tiktok' },
  { key: 'test', category: 'other', clusteringKey: '' }
];

const columns = [
  { key: 'foo', category: 'influencer', clusteringKey: 'instagram' },
  { key: 'bar', category: 'influencer', clusteringKey: 'youtube' },
  { key: 'code', category: 'affiliation', clusteringKey: '' }
];

const buildColumnDefinition = (key, category, clusteringKey) => {
  return {
    key,
    type: 'text',
    name: `${key}_name`,
    size: size,
    clustering_key: '',
    category: '',
    orderable: orderable,
    filterable: filterable,
    facetable: false
  };
};

const buildColumn = (key, category, clusteringKey) => {
  return {
    definition: def,
    filters: [
      {
        key: 'value',
        value: 'hello'
      }
    ]
  };
};

class Manager implements TableManager {
  fetchColumnDefinitions() {
    return Promise.resolve({
      column_definitions: columnDefinitions.reduce(
        (columnDefinitions, column) => [
          ...columnDefinitions,
          ...[buildColumnDefinition(column.key, column.category, column.clusteringKey)]
        ],
        []
      )
    });
  }
  fetchColumns() {
    return Promise.resolve({
      columns: columns.reduce(
        (columnDefinitions, column) => [
          ...columnDefinitions,
          ...[buildColumn(column.key, column.category, column.clusteringKey)]
        ],
        []
      )
    });
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse> {
    return Promise.resolve({ column_definitions: [] });
  }
  fetchColumns(): Promise<TableColumnsResponse> {
    return Promise.resolve({
      columns: [buildColumn('foo', FieldSize.Medium, false, true), buildColumn('bar', FieldSize.Medium, true, true)]
    });
  }
  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse> {
    return Promise.resolve({ columns: request.columns });
  }
}

class RowsFetcher {
  // @ts-ignore
  fetch(page: number, perPage: number) {
    return Promise.resolve({
      rows: [
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'ekip',
          bar: 'hello',
          toto: 'toto',
          code: 'code',
          test: 'test'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'ekip',
          bar: 'hello'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'ekip',
          bar: 'hello'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'ekip',
          bar: 'hello'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'ekip',
          bar: 'hello'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'ekip',
          bar: 'hello'
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar'
        },
      ],
      meta: { total: 12 }
    });
  }
}

export default class Application extends Controller {
  tableManager = new Manager();
  rowsFetcher = new RowsFetcher();
  handler = new TableHandler(this, this.tableManager, this.rowsFetcher);
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    application: Application;
  }
}
