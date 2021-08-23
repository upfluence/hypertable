class LocalStorageStore {
  constructor(table, key) {
    this.table = table;
    this.key = key;
  }

  getState() {
    if (window.localStorage.getItem(this.key)) {
      return JSON.parse(window.localStorage.getItem(this.key));
    } else {
      return null;
    }
  }

  update() {
    window.localStorage.setItem(
      this.key,
      JSON.stringify(
        this.table.columns.map((x) => {
          delete x.manager;
          return x;
        })
      )
    );
  }
}

export { LocalStorageStore };
