import Component from '@glimmer/component';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2RenderersNumericArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  extra?: { [key: string]: any };
}

export default class HyperTableV2CellRenderersNumeric extends Component<HyperTableV2RenderersNumericArgs> {
  get value() {
    return this.args.row[this.args.column.definition.key];
  }
}
