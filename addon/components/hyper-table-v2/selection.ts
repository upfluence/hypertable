import Component from '@glimmer/component';
import { action } from '@ember/object';

interface HyperTableV2SelectionArgs {
  selected: number;
  total: number;
  onClear(): void;
  onSelectAll(): void;
}

export default class HyperTableV2Selection extends Component<HyperTableV2SelectionArgs> {
  get allCreatorsSelected(): boolean {
    return this.args.selected === this.args.total;
  }

  get classes(): string {
    let classes = ['selection-container'];

    if (this.args.selected > 0) {
      classes.push('selection-container--visible');
    }

    return classes.join(' ');
  }

  @action
  onClear(): void {
    this.args.onClear();
  }

  @action
  onSelectAll(): void {
    this.args.onSelectAll();
  }
}