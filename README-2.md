Hypertable

==============================================================================

To follow the early life of this project, see
[oss-components#pn-flexbox-tables](https://github.com/upfluence/oss-components/pull/54/files)

# Compatibility

- Ember.js v3.24 or above
- Ember CLI v3.24 or above
- Node.js v12 or above

# Installation

```
ember install hypertable
```

# Usage

## Architecture

- **TableHandler** : The core system that manages data state, columns, filters, and selections
- **TableManager** : Interface for fetching and persisting column definitions
- **RowsFetcher** : Interface for fetching data in a paginated manner
- **Renderers** : Modular components for displaying cells and headers

## Basic Usage

### Quick Start

Follow these steps in order to set up Hypertable:

- **Create a TableManager implementation**
- **Create a RowsFetcher implementation**
- **Create a RenderingResolver implementation and custom rendering resolvers**
- **Initialize the TableHandler**
- **Use the HyperTableV2 component in the template**

```typescript
export default class MyController extends Controller {
  @tracked tableHandler: TableHandler;

  constructor() {
    super(...arguments);

    const manager = new MyTableManager();
    const fetcher = new MyRowsFetcher();
    const renderingResolver = new MyRenderingResolver();

    this.tableHandler = new TableHandler(this, manager, fetcher, renderingResolver);
  }

  features = {
    selection: true,
    searchable: true,
    manageable_fields: true,
    global_filters_reset: true
  };
}
```

### Template Usage

```handlebars
<HyperTableV2 @handler={{this.tableHandler}} @features={{this.features}} @options={{this.options}}>
  {{! Custom search block (optional) }}
  <:search>
    <MyCustomSearch @onSearch={{this.handleSearch}} />
  </:search>

  {{! Contextual actions (optional) }}
  <:contextual-actions>
    <button {{on 'click' this.doSomething}}>Contextual Action</button>
  </:contextual-actions>

  {{! Table actions (optional) }}
  <:table-actions>
    <button {{on 'click' this.doSomething}}>Table Action</button>
  </:table-actions>

  {{! Custom empty state (optional) }}
  <:empty-state>
    <div class='custom-empty-state'>This is an empty state</div>
  </:empty-state>
</HyperTableV2>
```

### Implementation Details

To use Hypertable, `TableManager` and `RowsFetcher` classes must be implemented to define how Hypertable interacts with data.

#### TableManager Implementation

```typescript
import { TableManager, ColumnDefinition, Column } from '@upfluence/hypertable/core/interfaces';

class MyTableManager implements TableManager {
  async fetchColumnDefinitions(): Promise<{ column_definitions: ColumnDefinition[] }> {
    // Fetch available column definitions from API
    const response = await fetch('/api/column-definitions');
    return response.json();
  }

  async fetchColumns(): Promise<{ columns: Column[] }> {
    // Fetch current column configuration from API
    const response = await fetch('/api/columns');
    return response.json();
  }

  async upsertColumns(request: { columns: Column[] }): Promise<{ columns: Column[] }> {
    // Save column configuration to API
    const response = await fetch('/api/columns', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return response.json();
  }

  // Optional: for faceted filtering
  async fetchFacets(columnKey: string, filteringKey: string, searchValue?: string): Promise<FacetsResponse> {
    const response = await fetch(`/api/facets/${columnKey}?filtering_key=${filteringKey}&search=${searchValue}`);
    return response.json();
  }
}
```

Methods available on TableManager:

- `fetchColumnDefinitions()` - Returns available column definitions
- `fetchColumns()` - Returns current column configuration
- `upsertColumns()` - Saves column configuration
- `fetchFacets()` - Optional: provides faceted filtering

#### RowsFetcher Implementation

```typescript
import { RowsFetcher, Row } from '@upfluence/hypertable/core/interfaces';

class MyRowsFetcher implements RowsFetcher {
  async fetch(page: number, perPage: number): Promise<{ rows: Row[]; meta: { total: number } }> {
    // Fetch paginated data from API
    const response = await fetch(`/api/data?page=${page}&per_page=${perPage}`);
    return response.json();
  }

  // Optional: for individual row updates
  async fetchById(recordId: number): Promise<Row> {
    const response = await fetch(`/api/data/${recordId}`);
    return response.json();
  }
}
```

Methods available on RowsFetcher:

- `fetch(page, perPage)` - Returns paginated data
- `fetchById(id)` - Optional: fetches individual rows

## Core Concepts

### Column Definitions

Column definitions describe the structure and capabilities of table columns. See `@upfluence/hypertable/core/interfaces/column.ts` for the complete type definition:

```typescript
type ColumnDefinition = {
  key: string; // Unique identifier
  type: string; // Data type (text, numeric, date)
  name: string; // Display name
  category: string; // Grouping identifier
  clustering_key: string; // Grouping identifier within a category
  size: FieldSize; // Column width (XS, S, M, L, XL)
  orderable: boolean; // Can be sorted
  orderable_by: string[] | null; // Fields to sort by
  filterable: boolean; // Can be filtered
  filterable_by: string[] | null; // Fields to filter by
  facetable: boolean; // Supports faceted search
  facetable_by: string[] | null; // Fields for facets
  empty_state_message?: string; // Message for empty values
  position?: {
    sticky: boolean; // Sticky column
    side?: 'left' | 'right'; // Which side to stick to
  };
};
```

### Row Data Structure

Row data is used by cell renderers to display values and by the selection system to identify records. See `@upfluence/hypertable/core/interfaces/rows-fetcher.ts` for the complete type definition:

```typescript
type Row = {
  influencerId: number;
  recordId: number;
  holderId: number;
  holderType: string;
  [key: string]: any; // Additional dynamic fields based on column definitions
};
```

### Filters and Ordering

Filter and order structures are used internally by the TableHandler to manage table state and are passed to the TableManager for persistence. See `@upfluence/hypertable/core/interfaces/column.ts` for complete type definitions:

```typescript
// Filter structure - used when applying column filters
type Filter = {
  key: string; // Field to filter on
  value: string; // Filter value
  extra?: any; // Additional filter parameters
};

// Ordering structure - used when sorting columns
type Order = {
  key: string; // Field to order by
  direction: 'asc' | 'desc'; // Sort direction
};
```

## Header Renderers

Header renderers provide functionality for column headers:

- **base** : Basic header with sorting
- **cell** : Individual cell header
- **column** : Column management
- **index** : Main header component
- **manage-columns** : Column visibility management
- **search** : Column-specific search
- **selection** : Column selection functionality

## Cell Renderers

Hypertable includes built-in cell renderers for common data types:

- **text** : Basic text, with ellipsis and tooltip
- **numeric** : Numbers, formatted
- **date** : Date, formatted

## Filtering Renderers

Filtering Renderers provide functionality for column filters:

- **text** : Text input filtering
- **numeric** : Numeric range filtering
- **date** : Date range filtering

## Custom Renderers

Create custom cell, header or filter renderers by extending the base component:

```typescript
// addon/components/my-custom-renderer.ts
interface MyCustomRendererArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  extra?: { [key: string]: any };
}

export default class MyCustomRenderer extends Component<MyCustomRendererArgs> {}
```

```handlebars
{{! addon/components/my-custom-renderer.hbs }}
<div class='custom-renderer'>
  <div>{{this.value}}</div>
</div>
```

### Custom rendering resolver for header, cells, filters mapping

The Rendering Resolver extends BaseRenderingResolver from @upfluence/hypertable/core/rendering-resolver and determines which component should be used to render each cell, filter, and header.

```typescript
type RendererDictionaryItem = { cell?: any; header?: any; filter?: any };

// Define mapping dictionary : all the custom columns and their renderers
const rendererMatchers: { [key: string]: RendererDictionaryItem } = {
  columnName: {
    cell: CustomCellRenderer,
    filter: CustomFilterRenderer,
    header: CustomHeaderRenderer
  }
};

export default class MyRenderingResolver extends BaseRenderingResolver {
  private context;

  constructor(emberContext: unknown) {
    super(emberContext);
    this.context = emberContext;
  }

  lookupCellComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this._lookupComponent(columnDef, 'cell');
  }

  lookupFilteringComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this._lookupComponent(columnDef, 'filter');
  }

  lookupHeaderComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this._lookupComponent(columnDef, 'header');
  }

  private _lookupComponent(
    columnDef: ColumnDefinition,
    type: 'header' | 'filter' | 'cell'
  ): Promise<ResolvedRenderingComponent> {
    let rendererMatch = rendererMatchers[camelize(columnDef.key)];

    if (rendererMatch && rendererMatch[type]) {
      return Promise.resolve({
        component: ensureSafeComponent(rendererMatch[type], this.context) as GlimmerComponent
      });
    }

    return super.lookupComponent(columnDef, type);
  }
}
```

## Built-in Components

HyperTableV2 includes several built-in components that provide table-level functionality. These components are used automatically based on the `@features` configuration and are not directly interacted with by the user:

### Automatic Components

- **HyperTableV2::Search** : Global search functionality - automatically included when `features.searchable: true`
- **HyperTableV2::Selection** : Row selection controls and display - automatically included when `features.selection: true`
- **HyperTableV2::ManageColumns** : Column visibility management interface - automatically included when `features.manageable_fields: true`
- **HyperTableV2::Column** : Column wrapper with header rendering - used internally for each table column
- **HyperTableV2::Cell** : Individual cell component with data rendering - used internally for each table cell

### User Interaction

These components are controlled through the `@features` parameter:

```typescript
features = {
  selection: true, // Enables HyperTableV2::Selection
  searchable: true, // Enables HyperTableV2::Search
  manageable_fields: true, // Enables HyperTableV2::ManageColumns
  global_filters_reset: true // Enables reset filters button
};
```

Users interact with these components through:

- **Search**: Typing in the search input (when searchable is enabled)
- **Selection**: Clicking checkboxes to select rows (when selection is enabled)
- **ManageColumns**: Clicking the manage columns button to show/hide columns (when manageable_fields is enabled)
- **Reset Filters**: Clicking the reset button to clear all filters (when global_filters_reset is enabled)

The components handle their own internal state and communicate with the TableHandler automatically.

## Faceted Filtering

Hypertable provides built-in support for **faceted filtering**, allowing users to select multiple values for a column filter from a dynamic list of facets.

1. **Enable Facets in `ColumnDefinition`**

To make a column facetable, set `facetable: true` and provide at least one key in `facetable_by`.

2. **Implement `fetchFacets` in `TableManager`**

The `TableManager` must implement a `fetchFacets` method to return facets for a given column.

```ts
class MyTableManager implements TableManager {
  async fetchFacets(columnKey: string, filteringKey: string, searchValue?: string): Promise<FacetsResponse> {
    const response = await fetch(`/api/facets/${columnKey}?filtering_key=${filteringKey}&search=${searchValue}`);
    return response.json();
  }
}
```

The `FacetsResponse` type should have the following structure:

```ts
type FacetsResponse = {
  filtering_key: string;
  facets: Facet[];
};

type Facet = {
  identifier: string; // Unique value sent in the filter request
  display_name: string; // Text displayed to the user
  count?: number; // (Optional) Used for sorting and displaying counts
};
```

3. **Built-in Facet Loader**

Hypertable ships with a `FacetsLoader` component that automatically:

- Fetches facets when the filter UI opens
- Displays a skeleton loader while loading
- Supports search with a 300 ms debounce
- Allows multiple facet selection
- Sorts facets by `count` descending by default (custom sorting function can be provided)

4. **Applying and Removing Facets**

When a user toggles a facet:

- `FacetsLoader` builds a filter object `{ key, value }`
- Calls `TableHandler.applyFilters()`
- Updates the `appliedFacets` list for that column

This behavior is automatic and does not require additional setup.

## Events

The TableHandler emits events throughout its lifecycle:

```typescript
this.tableHandler.on('columns-loaded', () => {
  console.log('Columns have been loaded');
});

// Available events:
// - 'columns-loaded'
// - 'row-click'
// - 'apply-filters'
// - 'reset-columns'
// - 'remove-column'
// - 'remove-row'
// - 'mutate-rows'
// - 'reset-rows'
```

## Advanced Usage

### Row Methods

Methods available on TableHandler for row manipulation:

```typescript
// Update a specific row from the data source
await this.tableHandler.updateRowById(123);

// Remove a row from the table
this.tableHandler.removeRow(123);

// Mutate a row in place
this.tableHandler.mutateRow(123, (row) => {
  row.someField = 'new value';
  return true; // Return true to trigger table redraw
});

// Toggle loading state for a specific row
this.tableHandler.toggleRowLoadingState(123);
```

### Column Methods

Methods available on TableHandler for column management:

```typescript
// Add a column to the table
await this.tableHandler.addColumn(column);

// Remove a column from the table
await this.tableHandler.removeColumn(columnDefinition);

// Reorder columns
this.tableHandler.reorderColumns(newColumnOrder);
```

### Selection Methods

Methods available on TableHandler for selection management:

```typescript
// Select all visible rows
this.tableHandler.toggleSelectAll(true);

// Select all rows globally (including those not currently loaded)
this.tableHandler.selectAllGlobal();

// Clear all selections
this.tableHandler.clearSelection();

// Update individual row selection
this.tableHandler.updateSelection(row);
```

## Contributing

### Installation

- `git clone <repository-url>`
- `cd hypertable`
- `pnpm install`

### Linting

- `pnpm lint:hbs`
- `pnpm lint:js`
- `pnpm lint:js --fix`

### Running tests

- `ember test` – Runs the test suite on the current Ember version
- `ember test --server` – Runs the test suite in "watch mode"
- `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

- `ember serve`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
