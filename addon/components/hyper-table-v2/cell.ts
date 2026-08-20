import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import type { InitialLoadAnimationContext } from '@upfluence/hypertable/components/hyper-table-v2';
import TableHandler from '@upfluence/hypertable/core/handler';
import { Column, ResolvedRenderingComponent, Row } from '@upfluence/hypertable/core/interfaces';

interface HyperTableV2CellArgs {
  handler: TableHandler;
  column: Column;
  row: Row;
  rowIndex?: number;
  initialLoadAnimation?: InitialLoadAnimationContext | null;
  enableInitialLoadAnimationExtraEffect?: boolean;
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

  get computedClass(): string {
    const classes = ['hypertable__cell'];

    if (this.loading) classes.push('hypertable__cell--loading');
    if (this.args.row?.hovered) classes.push('hypertable__cell--hovered');
    if (this.initialLoadAnimationSequenceClass) classes.push(this.initialLoadAnimationSequenceClass);
    if (this.initialLoadAnimationCellClass) classes.push(this.initialLoadAnimationCellClass);

    return classes.join(' ');
  }

  get initialLoadAnimationCellClass(): string {
    const extraColumnEffectClass = this.args.initialLoadAnimation?.extraColumnEffect?.class;

    if (!this.shouldApplyInitialLoadAnimationCustomEffect || !extraColumnEffectClass) {
      this.resetExtraEffectState();
      return '';
    }

    if (this.extraEffectActivationDelayMs <= 0) {
      return extraColumnEffectClass;
    }

    this.scheduleExtraEffectIfNeeded();

    return this.extraEffectReady ? extraColumnEffectClass : '';
  }

  get initialLoadAnimationSequenceClass(): string {
    return this.shouldApplyInitialLoadAnimationSequence ? 'hypertable__cell--initial-load-sequence' : '';
  }

  get initialLoadAnimationCellStyle(): ReturnType<typeof htmlSafe> | undefined {
    if (!this.shouldApplyInitialLoadAnimationSequence) {
      return undefined;
    }

    const extraColumnEffectDelayMs = this.args.initialLoadAnimation?.extraColumnEffect?.delayMs ?? 0;
    const staggeredDelayMs = this.rowAnimationDelayMs;
    const extraEffectDelayMs = staggeredDelayMs + extraColumnEffectDelayMs;

    return htmlSafe(
      `--hypertable-initial-rows-animation-delay: ${staggeredDelayMs}ms; --hypertable-initial-rows-extra-effect-delay: ${extraEffectDelayMs}ms;`
    );
  }

  private get rowAnimationDelayMs(): number {
    const delayMs = this.args.initialLoadAnimation?.delayMs ?? 0;
    const staggerMs = this.args.initialLoadAnimation?.staggerMs ?? 0;
    const rowIndex = this.args.rowIndex ?? 0;

    return delayMs + rowIndex * staggerMs;
  }

  private get isInitialLoadAnimationEnabled(): boolean {
    return this.args.initialLoadAnimation?.active === true;
  }

  private get isInitialLoadAnimationTargetedColumn(): boolean {
    const columns = this.args.initialLoadAnimation?.extraColumnEffect?.columns ?? [];

    if (columns.length === 0) return true;

    return columns.includes(this.args.column.definition.key);
  }

  private get shouldApplyInitialLoadAnimationSequence(): boolean {
    return this.isInitialLoadAnimationEnabled && !this.loading;
  }

  private get shouldApplyInitialLoadAnimationCustomEffect(): boolean {
    if (!this.args.enableInitialLoadAnimationExtraEffect) {
      return false;
    }

    return this.shouldApplyInitialLoadAnimationSequence && this.isInitialLoadAnimationTargetedColumn;
  }

  private get extraEffectActivationDelayMs(): number {
    return this.rowAnimationDelayMs + (this.args.initialLoadAnimation?.extraColumnEffect?.delayMs ?? 0);
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
}
