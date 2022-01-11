import Component from '@glimmer/component';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2HeaderRenderersBaseArgs {
  handler: TableHandler;
  column: Column;
  extra?: { [key: string]: any };
}

export default class HyperTableV2HeaderRenderersBase extends Component<HyperTableV2HeaderRenderersBaseArgs> {}
