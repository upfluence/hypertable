import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export type SummaryField = {
  label: string;
  value: string;
  tooltip?: string;
};

interface HyperTableV2SummaryArgs {
  loading: boolean;
  fields: SummaryField[];
  title?: string;
  titleTooltip?: string;
}

const DEFAULT_SKELETONS_COUNT = 4;

export default class HyperTableV2Summary extends Component<HyperTableV2SummaryArgs> {
  @service declare intl: any;

  get title(): string {
    return this.args.title ?? this.intl.t('hypertable.summary.title');
  }

  get skeletons(): number[] {
    const count = this.args.fields?.length || DEFAULT_SKELETONS_COUNT;
    return Array.from({ length: count }, (_, index) => index);
  }
}
