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
  orderable_by: string[] | null;
  filterable: boolean;
  filterable_by: string[] | null;
  facetable: boolean;
  facetable_by: string[] | null;
  position?: {
    sticky: boolean;
  };
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
