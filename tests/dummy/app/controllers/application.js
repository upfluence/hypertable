import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  plansFetcher: service(),
  hypertableManager: service(),

  collection: [],
  columns: [],

  tableOptions: {
    features: {
      search: true,
      selection: true,
      ordering: true,
      filtering: true
    }
  },

  init() {
    this._super();
    this._fetchPlans();
  },

  _fetchPlans() {
    this.set('refreshing', true);

    this.plansFetcher.fetch().then((data) => {
      this.set(
        'tableManager', this.hypertableManager.createTable(this.tableOptions)
      );
      this.tableManager.updateColumns(data.meta.columns);
      this.tableManager.updateData(data.items);
      this.tableManager.updateColumnCategories(data.meta.columnCategories);
    }).finally(() => {
      this.set('refreshing', false);
    });
  },

  actions: {
    columnsChanged(layout) {
      this.plansFetcher.fetch(layout).then((data) => {
        this.set('collection', data.items);
      });
    },

    performSearch(s) {
      alert(`Search: ${s}`);
    }
  }
});
