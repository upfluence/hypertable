import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, ResolvedRenderingComponent, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2CellArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  loading: boolean;
}

export default class HyperTableV2Cell extends Component<HyperTableV2CellArgs> {
  @tracked loadingCellComponent: boolean = false;
  @tracked cellComponent?: ResolvedRenderingComponent;

  constructor(owner: unknown, args: HyperTableV2CellArgs) {
    super(owner, args);

    this.loadingCellComponent = true;

    if (!args.loading) {
      args.handler.renderingResolver
        .lookupCellComponent(args.column.definition)
        .then((resolution) => {
          this.cellComponent = resolution;
        })
        .finally(() => {
          this.loadingCellComponent = false;
        });
    }
  }

  get loading(): boolean {
    return this.args.loading || this.loadingCellComponent;
  }
}
