// @ts-nocheck
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

interface HyperTableV2Args {}

export default class HyperTableV2 extends Component<HyperTableV2Args> {
  @tracked columns = []; 

  constructor(owner, args) {
    super(owner, args);

    args.handler.fetchColumns()
  }
}
