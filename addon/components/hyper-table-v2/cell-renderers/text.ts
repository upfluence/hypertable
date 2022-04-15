import Component from '@glimmer/component';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, FieldSize, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2CellRenderersTextArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  extra?: { [key: string]: any };
}

const ELLIPSIS_STEPS: { [key: string]: string } = {
  [FieldSize.ExtraSmall]: '100',
  [FieldSize.Small]: '160',
  [FieldSize.Medium]: '240',
  [FieldSize.Large]: '340',
  [FieldSize.ExtraLarge]: '400'
};

export default class HyperTableV2CellRenderersText extends Component<HyperTableV2CellRenderersTextArgs> {
  get ellipsisClass(): string {
    console.log(ELLIPSIS_STEPS);
    return `text-ellipsis-${ELLIPSIS_STEPS[this.args.column.definition.size]}`;
  }

  get value(): string {
    return this.args.row[this.args.column.definition.key];
  }
}
