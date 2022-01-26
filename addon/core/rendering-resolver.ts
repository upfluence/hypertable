import GlimmerComponent from '@glimmer/component';
import { ensureSafeComponent } from '@embroider/util';
import { RendererResolver, ResolvedRenderingComponent, ColumnDefinition } from '@upfluence/hypertable/core/interfaces';

import BaseHeaderRenderer from '@upfluence/hypertable/components/hyper-table-v2/header-renderers/base';
import TextCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/text';
import TextFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/text';
import NumericFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/numeric';

import NumericCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/numeric';

type RendererDictionaryItem = { cell: any; header: any; filter: any };
const rendererMatchers: { [key: string]: RendererDictionaryItem } = {
  default: {
    cell: TextCellRenderer,
    header: BaseHeaderRenderer,
    filter: TextFilteringRenderer
  },
  integer: {
    cell: NumericCellRenderer,
    header: BaseHeaderRenderer,
    filter: NumericFilteringRenderer
  }
};

export default class implements RendererResolver {
  private _context;

  constructor(emberContext: unknown) {
    this._context = emberContext;
  }

  private _lookupComponent(
    columnDef: ColumnDefinition,
    rendererType: 'header' | 'cell' | 'filter'
  ): Promise<ResolvedRenderingComponent> {
    return Promise.resolve({
      component: ensureSafeComponent(
        (rendererMatchers[columnDef.type] || rendererMatchers.default)[rendererType],
        this._context
      ) as GlimmerComponent
    });
  }

  lookupHeaderComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this._lookupComponent(columnDef, 'header');
  }

  lookupCellComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this._lookupComponent(columnDef, 'cell');
  }

  lookupFilteringComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return this._lookupComponent(columnDef, 'filter');
  }
}
