import { RowsFetcherResponse } from '@upfluence/hypertable/core/interfaces';

export default class RowsFetcher {
  // @ts-ignore
  fetch(page: number, perPage: number): Promise<RowsFetcherResponse> {
    return Promise.resolve({
      rows: [
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
          total: 123123
        }
      ],
      meta: { total: 12 }
    });
  }
}
