import { ensureSafeComponent } from '@embroider/util';
import GlimmerComponent from '@glimmer/component';

import DateCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/date';
import NumericCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/numeric';
import TextCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/text';
import DateFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/date';
import NumericFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/numeric';
import TextFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/text';
import BaseHeaderRenderer from '@upfluence/hypertable/components/hyper-table-v2/header-renderers/base';
import { RendererResolver, ResolvedRenderingComponent, ColumnDefinition } from '@upfluence/hypertable/core/interfaces';

type RendererDictionaryItem = { cell: any; header?: any; filter: any };
const rendererMatchers: { [key: string]: RendererDictionaryItem } = {
  default: {
    cell: TextCellRenderer,
    header: BaseHeaderRenderer,
    filter: TextFilteringRenderer
  },
  integer: {
    cell: NumericCellRenderer,
    filter: NumericFilteringRenderer
  },
  timestamp: {
    cell: DateCellRenderer,
    filter: DateFilteringRenderer
  }
};

export default class implements RendererResolver {
  private _context: unknown;

  constructor(emberContext: unknown) {
    this._context = emberContext;
  }

  lookupComponent(
    columnDef: ColumnDefinition,
    rendererType: 'header' | 'cell' | 'filter'
  ): Promise<ResolvedRenderingComponent> {
    return Promise.resolve({
      component: ensureSafeComponent(
        (rendererMatchers[columnDef.type] || rendererMatchers.default)[rendererType] ||
          rendererMatchers.default[rendererType],
        this._context
      ) as GlimmerComponent
    });
  }

  lookupHeaderComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this.lookupComponent(columnDef, 'header');
  }

  lookupCellComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this.lookupComponent(columnDef, 'cell');
  }

  lookupFilteringComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this.lookupComponent(columnDef, 'filter');
  }
}
