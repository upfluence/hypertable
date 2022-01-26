import GlimmerComponent from '@glimmer/component';
import { ensureSafeComponent } from '@embroider/util';
import { RendererResolver, ResolvedRenderingComponent, ColumnDefinition } from '@upfluence/hypertable/core/interfaces';

import BaseHeaderRenderer from '@upfluence/hypertable/components/hyper-table-v2/header-renderers/base';
import TextCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/text';
import TextFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/text';

import NumericCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/numeric';

type RendererDictionaryItem = { cell: any; header: any };
const rendererMatchers: { [key: string]: RendererDictionaryItem } = {
  default: {
    cell: TextCellRenderer,
    header: BaseHeaderRenderer
  },
  integer: {
    cell: NumericCellRenderer,
    header: BaseHeaderRenderer
  }
};

export default class implements RendererResolver {
  private _context;

  constructor(emberContext: unknown) {
    this._context = emberContext;
  }

  lookupHeaderComponent(_: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return Promise.resolve({
      component: ensureSafeComponent(BaseHeaderRenderer, this._context) as GlimmerComponent
    });
  }

  lookupCellComponent(columnDef: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return Promise.resolve({
      component: ensureSafeComponent(
        (rendererMatchers[columnDef.type] || rendererMatchers.default).cell,
        this._context
      ) as GlimmerComponent
    });
  }

  lookupFilteringComponent(_: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return Promise.resolve({
      component: ensureSafeComponent(TextFilteringRenderer, this._context) as GlimmerComponent
    });
  }
}
