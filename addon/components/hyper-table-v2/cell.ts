import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import type { InitialRowsAnimationContext } from '@upfluence/hypertable/components/hyper-table-v2';
import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, ResolvedRenderingComponent, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2CellArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  rowIndex?: number;
  initialRowsAnimation?: InitialRowsAnimationContext | null;
  disableInitialRowsAnimationExtraEffect?: boolean;
  loading: boolean;
  onClick?(row: Row): void;
  onHover?(row: Row, hovered: boolean): void;
}

export default class HyperTableV2Cell extends Component<HyperTableV2CellArgs> {
  @tracked loadingCellComponent: boolean = true;
  @tracked cellComponent?: ResolvedRenderingComponent;
  @tracked extraEffectReady: boolean = false;

  private extraEffectTimeout?: number;

  constructor(owner: unknown, args: HyperTableV2CellArgs) {
    super(owner, args);

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

  get initialRowsAnimationCellClass(): string {
    const extraColumnCellEffectClass = this.args.initialRowsAnimation?.extraColumnCellEffectClass;

    if (!this.shouldApplyInitialRowsAnimationCustomEffect || !extraColumnCellEffectClass) {
      this.resetExtraEffectState();
      return '';
    }

    if (this.extraEffectActivationDelayMs <= 0) {
      return extraColumnCellEffectClass;
    }

    this.scheduleExtraEffectIfNeeded();

    return this.extraEffectReady ? extraColumnCellEffectClass : '';
  }

  get initialRowsAnimationSequenceClass(): string {
    if (!this.shouldApplyInitialRowsAnimationSequence) {
      return '';
    }

    return 'hypertable__cell--initial-load-sequence';
  }

  get initialRowsAnimationCellStyle(): string | undefined {
    if (!this.shouldApplyInitialRowsAnimationSequence) {
      return undefined;
    }

    const extraColumnCellEffectDelayMs = this.args.initialRowsAnimation?.extraColumnCellEffectDelayMs ?? 0;
    const staggeredDelayMs = this.rowAnimationDelayMs;
    const extraEffectDelayMs = staggeredDelayMs + extraColumnCellEffectDelayMs;

    return `--hypertable-initial-rows-animation-delay: ${staggeredDelayMs}ms; --hypertable-initial-rows-extra-effect-delay: ${extraEffectDelayMs}ms;`;
  }

  private get rowAnimationDelayMs(): number {
    const delayMs = this.args.initialRowsAnimation?.delayMs ?? 0;
    const staggerMs = this.args.initialRowsAnimation?.staggerMs ?? 0;
    const rowIndex = this.args.rowIndex ?? 0;

    return delayMs + rowIndex * staggerMs;
  }

  private get isInitialRowsAnimationEnabled(): boolean {
    return this.args.initialRowsAnimation?.active === true;
  }

  private get isInitialRowsAnimationTargetedColumn(): boolean {
    const columns = this.args.initialRowsAnimation?.columns;

    if (!columns || columns.length === 0) {
      return true;
    }

    return columns.includes(this.args.column.definition.key);
  }

  private get shouldApplyInitialRowsAnimationSequence(): boolean {
    return this.isInitialRowsAnimationEnabled && !this.loading;
  }

  private get shouldApplyInitialRowsAnimationCustomEffect(): boolean {
    if (this.args.disableInitialRowsAnimationExtraEffect) {
      return false;
    }

    return this.shouldApplyInitialRowsAnimationSequence && this.isInitialRowsAnimationTargetedColumn;
  }

  private get extraEffectActivationDelayMs(): number {
    const extraColumnCellEffectDelayMs = this.args.initialRowsAnimation?.extraColumnCellEffectDelayMs ?? 0;
    return this.rowAnimationDelayMs + extraColumnCellEffectDelayMs;
  }

  private scheduleExtraEffectIfNeeded(): void {
    if (this.extraEffectReady || this.extraEffectTimeout) {
      return;
    }

    const activationDelayMs = this.extraEffectActivationDelayMs;

    if (activationDelayMs <= 0) {
      this.extraEffectReady = true;
      return;
    }

    this.extraEffectTimeout = window.setTimeout(() => {
      this.extraEffectReady = true;
      this.extraEffectTimeout = undefined;
    }, activationDelayMs);
  }

  private resetExtraEffectState(): void {
    if (this.extraEffectTimeout) {
      window.clearTimeout(this.extraEffectTimeout);
      this.extraEffectTimeout = undefined;
    }

    this.extraEffectReady = false;
  }

  @action
  clickedCell(event: MouseEvent) {
    event.stopPropagation();

    if (!this.args.loading) {
      this.args.onClick?.(this.args.row);
    }
  }

  @action
  toggleHover(row: Row, hovered: boolean) {
    this.args.onHover?.(row, hovered);
  }

  @action
  teardown() {
    this.resetExtraEffectState();
  }
}
