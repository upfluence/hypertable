import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { run } from '@ember/runloop';
import { isPresent } from '@ember/utils';

const SEARCH_DEBOUNCE = 500;

export default class ViewsComponent extends Component {
  @tracked isHiddenAddViewModal = true;
  @tracked isHiddenUpdateViewModal = true;
  @tracked isHiddenDeleteViewModal = true;

  @tracked newViewName = '';
  @tracked selectedView = null;
  @tracked isDeleteViewLoading = false;
  @tracked _searchQuery = '';
  @tracked filteredViews = [];

  filterViews() {
    this.filteredViews = this.args.manager.views.filter((view) =>
      view.name.toLowerCase().includes(this._searchQuery.toLowerCase())
    );
  }

  @action
  onSearchChange() {
    run.debounce(this, this.filterViews, SEARCH_DEBOUNCE);
  }

  @action
  addPredefinedView(view) {
    if (this.args.manager.hooks.onAddView) {
      this.args.manager.hooks.onAddView(view.name, view.table);
      this.args.manager.predefinedViews.removeObject(view);
    }
  }

  @action
  addView() {
    if (this.args.manager.hooks.onAddView && isPresent(this.newViewName)) {
      this.args.manager.hooks.onAddView(this.newViewName);
      this.isHiddenAddViewModal = !this.isHiddenAddViewModal;
    }
  }

  @action
  updateView() {
    if (this.args.manager.hooks.onUpdateView && this.selectedView) {
      this.args.manager.hooks.onUpdateView(this.selectedView);
      this.isHiddenUpdateViewModal = !this.isHiddenUpdateViewModal;
    }
  }

  @action
  deleteView() {
    if (this.args.manager.hooks.onDeleteView && this.selectedView) {
      this.isDeleteViewLoading = true;
      this.args.manager.hooks
        .onDeleteView(this.selectedView)
        .then(() => {
          this.isHiddenDeleteViewModal = !this.isHiddenDeleteViewModal;
        })
        .finally(() => {
          this.isDeleteViewLoading = true;
        });
    }
  }

  @action
  selectView(view) {
    if (this.args.manager.hooks.onSelectView) {
      this.selectedView = view;
      this.args.manager.hooks.onSelectView(view);
    }
  }

  @action
  toggleAddViewModal(event) {
    event?.stopPropagation();
    this.newViewName = '';
    this.isHiddenAddViewModal = !this.isHiddenAddViewModal;
  }

  @action
  toggleUpdateViewModal(selectedView) {
    this.selectedView = selectedView;
    this.isHiddenUpdateViewModal = !this.isHiddenUpdateViewModal;
  }

  @action
  toggleDeleteViewModal(selectedView) {
    this.selectedView = selectedView;
    this.isHiddenDeleteViewModal = !this.isHiddenDeleteViewModal;
  }
}
