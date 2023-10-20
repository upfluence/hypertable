import Component from '@glimmer/component';
import { computed, defineProperty } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2CellRenderersTextArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  extra?: { [key: string]: any };
}

export default class HyperTableV2CellRenderersText extends Component<HyperTableV2CellRenderersTextArgs> {
  constructor(owner: unknown, args: HyperTableV2CellRenderersTextArgs) {
    super(owner, args);

    defineProperty(
      this,
      'value',
      computed(`args.row.${args.column.definition.key}`, function() {
        return this.args.row[this.args.column.definition.key];
      })
    );
  }
}
