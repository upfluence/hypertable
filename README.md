# Hypertable

To follow the early life of this project, see
[oss-components#pn-flexbox-tables](https://github.com/upfluence/oss-components/pull/54/files)

## Table of Contents

- [Compatibility](#compatibility)
- [Installation](#installation)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Rendering System](#rendering-system)
- [Built-in Components](#built-in-components)
- [Events](#events)
- [Contributing](#contributing)

## Compatibility

- Ember.js v3.24 or above
- Ember CLI v3.24 or above
- Node.js v12 or above

## Installation

```
ember install hypertable
```

## Architecture

- **TableHandler** - The core system that manages data state, columns, filters, and selections
- **TableManager** - Interface for fetching and persisting column definitions and configurations
- **RowsFetcher** - Interface for fetching paginated data
- **RenderingResolver** - Maps column definitions to appropriate cell, header, and filter renderers
- **Renderers** - Modular components for displaying cells, headers, and filters

## Quick Start

### 1. Implement Required Interfaces

Create implementations for the two required interfaces and add a rendering resolver if needed:

```ts
export default class MyController extends Controller {
  constructor() {
    super(...arguments);

    const manager = new MyTableManager();
    const fetcher = new MyRowsFetcher();
    const renderingResolver = new MyRenderingResolver(); // Optional

    this.handler = new TableHandler(this, manager, fetcher, renderingResolver);
  }

  features = {
    selection: true,
    searchable: true,
    manageable_fields: true,
    global_filters_reset: true
  };
}
```

### 2. Use HyperTableV2 Component in template

```hbs
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

### 3. Interface Implementations

#### TableManager

```typescript
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

**Available methods:**

- `fetchColumnDefinitions()` - Returns available column definitions
- `fetchColumns()` - Returns current column configuration
- `upsertColumns(request)` - Saves column configuration
- `fetchFacets(columnKey, filteringKey, searchValue)` - Optional: provides faceted filtering

#### RowsFetcher

```ts
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

**Available methods:**

- `fetch(page, perPage)` - Returns paginated data
- `fetchById(id)` - Optional: fetches individual rows

#### Custom rendering resolver (Optional)

If no RenderingResolver is provided, Hypertable uses a default resolver with built-in renderers.
The Rendering Resolver extends BaseRenderingResolver from `@upfluence/hypertable/core/rendering-resolver` and determines which component should be used to render each cell, filter, and header according to column key.

```typescript
type RendererDictionaryItem = { cell?: any; header?: any; filter?: any };

// Define mapping dictionary: all the custom columns and their renderers
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
        component: ensureSafeComponent(rendererMatch[type], this.context)
      });
    }

    return super.lookupComponent(columnDef, type);
  }
}
```

## Core Concepts

### Column Definitions

Column definitions describe the structure and capabilities of table columns. See `@upfluence/hypertable/core/interfaces/column.ts` for the complete type definition:

```ts
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

```ts
type Row = {
  influencerId: number;
  recordId: number;
  holderId: number;
  holderType: string;
  [key: string]: any; // Additional dynamic fields based on column definitions
};
```

### Column Management

```typescript
// Add a column to the table
await this.handler.addColumn(columnDefinition);

// Remove a column from the table
await this.handler.removeColumn(columnDefinition);

// Reorder columns
this.handler.reorderColumns(newColumnOrder);

// Reset column filters and ordering
await this.handler.resetColumns(columnsToReset);
```

### Row Management

```typescript
// Update a specific row from the data source
await this.handler.updateRowById(123);

// Remove a row from the table
this.handler.removeRow(123);

// Mutate a row in place and trigger redraw
this.handler.mutateRow(123, (row) => {
  row.someField = 'new value';
  return true; // Return true to trigger table redraw
});

// Toggle loading state for a specific row
this.handler.toggleRowLoadingState(123);

// Reset all rows and refetch
await this.handler.resetRows();
```

### Selection Management

Hypertable supports two selection modes:

1. **Array mode**: `selection` contains selected rows
2. **Global mode**: `selection = 'all'` with `exclusion` containing unselected rows

```ts
// Select all visible rows
this.tableHandler.toggleSelectAll(true);

// Select all rows globally (including those not currently loaded)
this.tableHandler.selectAllGlobal();

// Clear all selections
this.tableHandler.clearSelection();

// Update individual row selection
this.tableHandler.updateSelection(row);

// Access current selection state
const selection = this.handler.selection; // Row[] | 'all'
const exclusions = this.handler.exclusion; // Row[] (when selection is 'all')
```

### Filtering and Ordering

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

```ts
// Apply filters to a column
await this.handler.applyFilters(column, [{ key: 'name', value: 'value' }]);

// Apply ordering to a column
await this.handler.applyOrder(column, 'asc'); // or 'desc'

// Fetch facets for filtering (requires TableManager.fetchFacets)
const facets = await this.handler.fetchFacets('value', 'name', 'searchValue');
```

#### Faceted Filtering

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

## Rendering System

### Built-in Renderers

Hypertable includes built-in renderers for common data types:

#### Cell Renderers

- **text** - Basic text with ellipsis and tooltip
- **numeric** - Formatted numbers
- **date** - Formatted dates

#### Filter Renderers

- **text** - Text input filtering
- **numeric** - Numeric range filtering
- **date** - Date range filtering

#### Header Renderers

- **base** - Basic header with sorting capabilities
- **cell** - Individual cell header functionality
- **column** - Column management features
- **index** - Main header component
- **manage-columns** - Column visibility management
- **search** - Column-specific search
- **selection** - Column selection functionality

### Custom Renderers

Create custom renderers by extending base components:

```ts
// addon/components/my-custom-renderer.ts
interface MyCustomRendererArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  extra?: { [key: string]: any };
}

export default class MyCustomRenderer extends Component<MyCustomRendererArgs> {}
```

```hbs
{{! Template }}
<div class='custom-cell'>
  <div>{{this.value}}</div>
</div>
```

Then register it in the RenderingResolver:

```typescript
const rendererMatchers = {
  my_column_key: {
    cell: MyCustomCellRenderer,
    filter: MyCustomFilterRenderer,
    header: MyCustomHeaderRenderer
  }
};
```

### Built-in Components

HyperTableV2 includes several automatic components controlled by the `@features` configuration:

### Feature-Controlled Components

```ts
features = {
  selection: true, // Enables row selection checkboxes
  searchable: true, // Enables global search input
  manageable_fields: true, // Enables column visibility management
  global_filters_reset: true // Enables reset filters button
};
```

These components are automatically included and handle their own state:

- **HyperTableV2::Search** - Global search across all data
- **HyperTableV2::Selection** - Row selection controls and display
- **HyperTableV2::ManageColumns** - Column visibility management
- **HyperTableV2::Column** - Column wrapper with header rendering
- **HyperTableV2::Cell** - Individual cell component

Users interact with these components through:

- **Search**: Typing in the search input (when searchable is enabled)
- **Selection**: Clicking checkboxes to select rows (when selection is enabled)
- **ManageColumns**: Clicking the manage columns button to show/hide columns (when manageable_fields is enabled)
- **Reset Filters**: Clicking the reset button to clear all filters (when global_filters_reset is enabled)

The components handle their own internal state and communicate with the TableHandler automatically.

## Events

TableHandler emits events throughout its lifecycle. Listen to them using the `on` method:

```ts
// Listen to specific events
this.handler.on('row-click', (row) => {
  console.log('Row clicked:', row);
});

this.handler.on('apply-filters', (column, filters) => {
  console.log('Filters applied:', column.definition.key, filters);
});

this.handler.on('columns-loaded', () => {
  console.log('Columns have been loaded and are ready');
});
```

**Available events:**

- `'columns-loaded'` - When columns are fetched and ready
- `'row-click'` - When a user clicks on a row
- `'apply-filters'` - When filters are applied to a column
- `'reset-columns'` - When columns are reset
- `'remove-column'` - When a column is removed
- `'remove-row'` - When a row is removed
- `'mutate-rows'` - When rows are mutated
- `'reset-rows'` - When rows are reset

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

### License

This project is licensed under the [MIT License](LICENSE.md).
