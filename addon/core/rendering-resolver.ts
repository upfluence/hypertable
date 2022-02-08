import GlimmerComponent from '@glimmer/component';
import { ensureSafeComponent } from '@embroider/util';
import { RendererResolver, ResolvedRenderingComponent, ColumnDefinition } from '@upfluence/hypertable/core/interfaces';

import BaseHeaderRenderer from '@upfluence/hypertable/components/hyper-table-v2/header-renderers/base';

import TextCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/text';
import TextFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/text';

import NumericCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/numeric';
import NumericFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/numeric';

import DateCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/date';
import DateFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/date';

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
  protected context: unknown;

  constructor(emberContext: unknown) {
    this.context = emberContext;
  }

  lookupComponent(
    columnDef: ColumnDefinition,
    rendererType: 'header' | 'cell' | 'filter'
  ): Promise<ResolvedRenderingComponent> {
    return Promise.resolve({
      component: ensureSafeComponent(
        (rendererMatchers[columnDef.type] || rendererMatchers.default)[rendererType] ||
          rendererMatchers.default[rendererType],
        this.context
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
