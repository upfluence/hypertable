import GlimmerComponent from '@glimmer/component';
import { ensureSafeComponent } from '@embroider/util';
import { RendererResolver, ResolvedRenderingComponent, ColumnDefinition } from '@upfluence/hypertable/core/interfaces';

import BaseHeaderRenderer from '@upfluence/hypertable/components/hyper-table-v2/header-renderers/base';
import TextCellRenderer from '@upfluence/hypertable/components/hyper-table-v2/cell-renderers/text';
import TextFilteringRenderer from '@upfluence/hypertable/components/hyper-table-v2/filtering-renderers/text';

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

  lookupCellComponent(_: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return Promise.resolve({
      component: ensureSafeComponent(TextCellRenderer, this._context) as GlimmerComponent
    });
  }


  lookupFilteringComponent(_: ColumnDefinition): Promise<ResolvedRenderingComponent> {
    return Promise.resolve({
      component: ensureSafeComponent(TextFilteringRenderer, this._context) as GlimmerComponent
    });
  }
}
