import Component from '@glimmer/component';
import { typeOf } from '@ember/utils';
import moment from 'moment';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2RenderersDateArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  extra?: { [key: string]: any };
}

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

export default class HyperTableV2CellRenderersDate extends Component<HyperTableV2RenderersDateArgs> {
  get value() {
    return this.args.row[this.args.column.definition.key];
  }

  get dateFormat() {
    // There used to be this feature in V1 , do we need it ?
    // @ts-ignore
    return this.args.column?.dateFormat || DEFAULT_DATE_FORMAT;
  }

  get formattedDate() {
    if (typeOf(this.value) === 'date') {
      return moment(this.value).format(this.dateFormat);
    } else {
      return moment.unix(this.value).format(this.dateFormat);
    }
  }
}
