import Component from '@glimmer/component';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2CellRenderersTextArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  extra?: { [key: string]: any };
}

export default class HyperTableV2CellRenderersText extends Component<HyperTableV2CellRenderersTextArgs> {}
