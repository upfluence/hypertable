# Architecture

- **TableHandler** - The core system that manages data state, columns, filters, and selections
- **TableManager** - Interface for fetching and persisting column definitions and configurations
- **RowsFetcher** - Interface for fetching paginated data
- **RenderingResolver** - Maps column definitions to appropriate cell, header, and filter renderers
- **Renderers** - Modular components for displaying cells, headers, and filters
