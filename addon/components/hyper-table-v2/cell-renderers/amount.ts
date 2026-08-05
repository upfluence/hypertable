import Component from '@glimmer/component';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2CellRenderersAmountArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
}

export type Amount = {
  cents: number;
  currency: string;
};

export default class HyperTableV2CellRenderersAmount extends Component<HyperTableV2CellRenderersAmountArgs> {
  get value(): Amount | undefined {
    return this.args.row[this.args.column.definition.key];
  }
}
