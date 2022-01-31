import Component from '@glimmer/component';
import moment from 'moment';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2RenderersDateArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  extra?: { [key: string]: any };
}

const DEFAULT_DATE_FORMAT = 'MMMM D, YYYY';

export default class HyperTableV2CellRenderersDate extends Component<HyperTableV2RenderersDateArgs> {
  get value() {
    return this.args.row[this.args.column.definition.key];
  }

  get formattedDate() {
    return moment.unix(this.value).format(DEFAULT_DATE_FORMAT);
  }
}
