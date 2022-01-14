import Controller from '@ember/controller';

import TableHandler from '@upfluence/hypertable/core/handler';
import {
  Column,
  ColumnDefinition,
  ColumnDefinitionResponse,
  TableColumnUpsertRequest,
  TableColumnUpsertResponse,
  FieldSize,
  TableManager
} from '@upfluence/hypertable/core/interfaces';

const buildColumn = (key: string, size = FieldSize.Medium, filterable = false, orderable = false): Column => {
  const def: ColumnDefinition = {
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
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse> {
    return Promise.resolve({ column_definitions: [] });
  }
  fetchColumns() {
    return Promise.resolve({
      columns: [buildColumn('foo', FieldSize.Medium, false, true), buildColumn('bar', FieldSize.Medium, true, true)]
    });
  }
  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse> {
    console.log(request)
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
