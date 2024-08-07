import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
  { key: 'foo', extra: { category: 'influencer', clustering_key: 'instagram' } },
  { key: 'bar', extra: { category: 'influencer', clustering_key: 'youtube' } },
  { key: 'code', extra: { category: 'affiliation', clustering_key: '' } },
  { key: 'toto', extra: { category: 'influencer', clustering_key: 'tiktok' } },
  { key: 'test', extra: { category: 'other', clustering_key: '' } }
];

const columns = [
  { key: 'foo', extra: { filterable: true, category: 'influencer', clustering_key: 'instagram' } },
  { key: 'time', extra: { orderable: true, filterable: true, category: 'influencer', type: 'timestamp' } },
  { key: 'total', extra: { orderable: true, filterable: true, category: 'influencer', type: 'integer' } },
  { key: 'bar', extra: { category: 'influencer', clustering_key: 'youtube' } },
  { key: 'code', extra: { category: 'affiliation', clustering_key: '' } },

  { key: 'foo', extra: { filterable: true, category: 'influencer', clustering_key: 'instagram' } },
  { key: 'time', extra: { orderable: true, filterable: true, category: 'influencer', type: 'timestamp' } },
  { key: 'total', extra: { orderable: true, filterable: true, category: 'influencer', type: 'integer' } },
  { key: 'bar', extra: { category: 'influencer', clustering_key: 'youtube' } },
  { key: 'code', extra: { category: 'affiliation', clustering_key: '' } },

  { key: 'foo', extra: { filterable: true, category: 'influencer', clustering_key: 'instagram' } },
  { key: 'time', extra: { orderable: true, filterable: true, category: 'influencer', type: 'timestamp' } },
  { key: 'total', extra: { orderable: true, filterable: true, category: 'influencer', type: 'integer' } },
  { key: 'bar', extra: { category: 'influencer', clustering_key: 'youtube' } },
  { key: 'code', extra: { category: 'affiliation', clustering_key: '' } }
];

const buildColumnDefinition = (key: string, extra: { [key: string]: any }): ColumnDefinition => {
  let defaultColumnDefinition = {
    key: key,
    type: 'text',
    name: `Name: ${key}`,
    clustering_key: '',
    category: '',
    size: FieldSize.Medium,
    orderable: true,
    orderable_by: [],
    filterable: false,
    filterable_by: [],
    facetable: false,
    facetable_by: ['value']
  };

  return Object.assign(defaultColumnDefinition, extra);
};

const buildColumn = (key: string, extra: { [key: string]: any }): Column => {
  return {
    definition: buildColumnDefinition(key, extra),
    filters: [
      {
        key: 'value',
        value: 'hello'
      }
    ]
  };
};

class Manager implements TableManager {
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse> {
    return Promise.resolve({
      column_definitions: columnDefinitions.reduce(
        (columnDefinitions, column) => [...columnDefinitions, ...[buildColumnDefinition(column.key, column.extra)]],
        []
      )
    });
  }
  fetchColumns(): Promise<TableColumnsResponse> {
    return Promise.resolve({
      columns: columns.reduce(
        (columnDefinitions, column) => [...columnDefinitions, ...[buildColumn(column.key, column.extra)]],
        []
      )
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
          test: 'test',
          total: 123,
          time: 1344549600 // should be 2012.08.10
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar',
          total: 123.393,
          time: 1643289899
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'ekip',
          bar: 'hello',
          total: 123
        },
        {
          influencerId: Math.random(),
          recordId: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar',
          total: 123000
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
        }
      ],
      meta: { total: 12 }
    });
  }
}

export default class Application extends Controller {
  @tracked searchQuery: string = '';
  @tracked selectedValue: number = 0;

  tableManager = new Manager();
  rowsFetcher = new RowsFetcher();
  handler = new TableHandler(this, this.tableManager, this.rowsFetcher);

  init() {
    super.init();

    this.handler.on('row-click', (row) => {
      console.log(row);
    });
  }

  @action
  onCustomSearchInput() {
    this.handler.applyFilters(this.handler.columns[0], [
      {
        key: 'value',
        value: this.searchQuery
      }
    ]);
  }

  @action
  updateSelected(value: number): void {
    this.selectedValue = value;
  }

  @action
  onClear(): void {
    console.log('clear');
  }

  @action
  onSelectAll(): void {
    console.log('sellect all');
  }
}

declare module '@ember/controller' {
  interface Registry {
    application: Application;
  }
}
