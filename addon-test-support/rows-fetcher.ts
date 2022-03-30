import { RowsFetcherResponse } from '@upfluence/hypertable/core/interfaces';

export default class RowsFetcher {
  // @ts-ignore
  fetch(page: number, perPage: number): Promise<RowsFetcherResponse> {
    return Promise.resolve({
      rows: [
        {
          influencerId: 42,
          recordId: 12,
          record_id: 12,
          holderId: 57,
          holderType: 'list',
          foo: 'ekip',
          bar: 'hello',
          total: 123,
          date: 1643386394
        },
        {
          influencerId: 43,
          recordId: 13,
          record_id: 13,
          holderId: 57,
          holderType: 'list',
          foo: 'second',
          bar: 'second bar',
          total: 123123,
          date: 0
        }
      ],
      meta: { total: 12 }
    });
  }
}
