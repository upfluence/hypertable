import { type TestContext } from '@ember/test-helpers';

import TableHandler from '@upfluence/hypertable/core/handler';
import { TableManager, RowsFetcher } from '@upfluence/hypertable/test-support';
import sinon from 'sinon';

export function setupTable(hooks: NestedHooks): void {
  hooks.beforeEach(function (this: TestContext) {
    this.tableManager = new TableManager();
    this.tableRowsFetcher = new RowsFetcher();
    this.tableHandler = new TableHandler(this, this.tableManager, this.tableRowsFetcher);
    this.tableRows = [];

    sinon.stub(this.tableRowsFetcher, 'fetch').callsFake(() => {
      return Promise.resolve({
        rows: this.tableRows,
        meta: {
          total: this.tableRows.length
        }
      });
    });
  });
}
