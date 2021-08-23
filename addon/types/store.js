class LocalStorageStore {
  constructor(table, key) {
    this.table = table;
    this.key = key;
  }

  getState() {
    const state = window.localStorage.getItem(this.key);
    return state ? JSON.parse(state) : null;
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
