// @ts-nocheck
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

import TableHandler from '@upfluence/hypertable/core/handler';

const buildColumn = (key) => {
  const def = {
    key,
    type: 'text',
    name: `${key}_name`,
    orderable: false,
    filterable: false,
    facetable: false
  };

  return {
    definition: def,
    filters: []
  };
};

class Manager {
  fetchColumnDefinitions(): Promise<ColumnDefinitionResponse>;
  fetchColumns() {
    return Promise.resolve({ columns: [buildColumn('foo'), buildColumn('bar')] });
  }
  upsertColumns(request: TableColumnUpsertRequest): Promise<TableColumnUpsertResponse>;
}

class RowsFetcher {
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
        }
      ],
      meta: { total: 12 }
    });
  }
}

export default class Application extends Controller {
  tableManager = new Manager();
  rowsFetcher = new RowsFetcher();
  handler = new TableHandler(
    this.tableManager,
    this.rowsFetcher
    // A custom renderingResolver implementation could be passed too.
  );
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    application: Application;
  }
}
