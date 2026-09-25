import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import type { IntlService } from 'ember-intl';

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
  @service declare intl: IntlService;

  constructor(owner: unknown, args: HyperTableV2SummaryArgs) {
    super(owner, args);

    assert(
      '[component][HyperTableV2::Summary] Boolean @loading argument is mandatory.',
      typeof args.loading === 'boolean'
    );
    assert('[component][HyperTableV2::Summary] Array @fields argument is mandatory.', Array.isArray(args.fields));
  }

  get title(): string {
    return this.args.title ?? this.intl.t('hypertable.summary.title');
  }

  get skeletons(): number[] {
    const count = this.args.fields.length || DEFAULT_SKELETONS_COUNT;
    return Array.from({ length: count }, (_, index) => index);
  }
}
