export enum FieldSize {
  ExtraSmall = 'XS',
  Small = 'S',
  Medium = 'M',
  Large = 'L',
  ExtraLarge = 'XL'
}

export type ColumnDefinition = {
  key: string;
  type: string;
  name: string;
  clustering_key: string;
  category: string;
  size: FieldSize;
  orderable: boolean;
  orderable_by: string[];
  filterable: boolean;
  filterable_by: string[];
  facetable: boolean;
  facetable_by: string[];
};

export type Filter = {
  key: string;
  value: string;
};

export type OrderDirection = 'asc' | 'desc';

export type Order = {
  key: string;
  direction: OrderDirection;
};

export type Column = {
  definition: ColumnDefinition;
  filters: Filter[];
  order?: Order;
};
