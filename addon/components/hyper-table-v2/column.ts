import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, FieldSize, ResolvedRenderingComponent } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2ColumnArgs {
  handler: TableHandler;
  column: Column;
}

export default class HyperTableV2Column extends Component<HyperTableV2ColumnArgs> {
  @tracked loadingHeaderComponent: boolean = true;
  @tracked headerComponent?: ResolvedRenderingComponent;

  constructor(owner: unknown, args: HyperTableV2ColumnArgs) {
    super(owner, args);

    args.handler.renderingResolver
      .lookupHeaderComponent(args.column.definition)
      .then((resolution) => {
        this.headerComponent = resolution;
      })
      .finally(() => {
        this.loadingHeaderComponent = false;
      });
  }

  get computedClasses(): string {
    const classes = ['hypertable__column'];

    classes.push(this.sizeClass);

    if (this.args.column.order) {
      classes.push('hypertable__column--ordered');
      classes.push(`hypertable__column--ordered-${this.args.column.order.direction}`);
    }

    return classes.join(' ');
  }

  get sizeClass(): string {
    let size = FieldSize.Medium;

    if (Object.values(FieldSize).includes(this.args.column.definition.size)) {
      size = this.args.column.definition.size;
    }

    return `hypertable__column--size-${size}`;
  }

  @action
  orderColumn() {
    if (!this.args.column.definition.orderable) return;

    this.args.handler.applyOrder(this.args.column, this.args.column.order?.direction === 'desc' ? 'asc' : 'desc')
  }
}
