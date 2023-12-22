import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ToastService from '@upfluence/oss-components/services/toast';

interface ViewsViewComponentArgs {
  view: any;
  deleteView(): void;
  toggleUpdateViewModal(): void;
  selectedView: any;
  predefined: boolean;
  addPredefinedView(view: any): void;
  onSelectView(view: any): void;
}

export default class ViewComponent extends Component<ViewsViewComponentArgs> {
  @service declare intl: any;
  @service declare toast: ToastService;
  @tracked displaySharingModal: boolean = false;

  @action
  openSharingModal(event: PointerEvent) {
    event.stopPropagation();
    this.displaySharingModal = true;
  }

  @action
  closeOwnershipModal() {
    this.displaySharingModal = false;
  }

  @action
  onOwnershipUpdated() {
    this.toast.success(
      this.intl.t('hypertable.view.share.modal.success.message'),
      this.intl.t('hypertable.view.share.modal.success.title')
    );
  }
}
