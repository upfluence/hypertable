export enum FieldSize {
  ExtraSmall = 'XS',
  Small = 'S',
  Medium = 'M',
  Large = 'L'
}

export type ColumnDefinition = {
  key: string;
  type: string;
  name: string;
  clustering_key: string;
  category: string;
  size: FieldSize;
  orderable: boolean;
  filterable: boolean;
  facetable: boolean;
};

export type Filter = {
  key: string;
  value: string;
};

export type Order = {
  key: string;
  direction: string;
};

export type Column = {
  definition: ColumnDefinition;
  filters: Filter[];
  order?: Order;
};
