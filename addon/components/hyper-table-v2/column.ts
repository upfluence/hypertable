import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, FieldSize, ResolvedRenderingComponent } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2ColumnArgs {
  handler: TableHandler;
  column: Column;
}

export default class HyperTableV2Column extends Component<HyperTableV2ColumnArgs> {
  @tracked elementId: string = '';
  @tracked loadingHeaderComponent: boolean = true;
  @tracked loadingFilteringComponent: boolean = true;
  @tracked headerComponent?: ResolvedRenderingComponent;
  @tracked filteringComponent?: ResolvedRenderingComponent;
  @tracked displayFilteringComponent: boolean = false;

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

    if (args.column.definition.orderable || args.column.definition.filterable) {
      args.handler.renderingResolver
        .lookupFilteringComponent(args.column.definition)
        .then((resolution) => {
          this.filteringComponent = resolution;
        })
        .finally(() => {
          this.loadingFilteringComponent = false;
        });
    }

    this.elementId = guidFor(args.column.definition.key);
  }

  get computedClasses(): string {
    const classes = ['hypertable__column'];

    classes.push(this.sizeClass);

    if (this.args.column.order) {
      classes.push('hypertable__column--ordered', `hypertable__column--ordered-${this.args.column.order.direction}`);
    }

    if (this.args.column.filters.length > 0) {
      classes.push('hypertable__column--filtered');
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
  orderColumn(e: MouseEvent): void {
    e.stopPropagation();

    if (!this.args.column.definition.orderable) return;

    this.args.handler.applyOrder(this.args.column, this.args.column.order?.direction === 'desc' ? 'asc' : 'desc');
  }

  @action
  toggleFilteringComponent(e: MouseEvent): void {
    e?.stopPropagation?.();

    if (this.args.handler.tetherOn !== this.args.column.definition.key) {
      this.args.handler.destroyTetherInstance();
    }

    this.args.handler.triggerTetherContainer(this.args.column.definition.key, {
      element: `#${this.elementId} .available-filters`,
      target: `#${this.elementId} header`,
      attachment: 'top right',
      targetAttachment: 'bottom right'
    });
  }

  willDestroy() {
    if (this.args.handler.tetherOn !== this.args.column.definition.key) {
      this.args.handler.destroyTetherInstance();
    }
  }
}
