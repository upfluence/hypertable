export type Row = {
  influencerId: number;
  recordId: number;
  holderId: number;
  holderType: string;
  isLoading?: boolean;
  [key: string]: any;
};

export type RowsFetcherMetadata = {
  total: number;
};

export type RowsFetcherResponse = {
  meta: RowsFetcherMetadata;
  rows: Row[];
};

export interface RowsFetcher {
  fetch(page: number, perPage: number): Promise<RowsFetcherResponse>;
  fetchById?(recordId: number): Promise<Row>;
}
