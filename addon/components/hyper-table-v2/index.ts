import Component from '@glimmer/component';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column } from '@upfluence/hypertable/core/interfaces';


interface HyperTableV2Args {
  handler: TableHandler;
}

export default class HyperTableV2 extends Component<HyperTableV2Args> {
  loadingSkeletons = new Array(3);

  constructor(owner: unknown, args: HyperTableV2Args) {
    super(owner, args);

    args.handler.fetchColumns().then(() => {
      args.handler.fetchRows();
    });
  }

  @action
  reorderColumns(columns: Column[]): void {
    this.args.handler.reorderColumns([this.args.handler.columns[0]].concat(columns));
  }
}