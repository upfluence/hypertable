class LocalStorageStore {
  constructor(storageKey) {
    this.key = storageKey;
  }

  getState() {
    const state = window.localStorage.getItem(this.key);
    return state ? JSON.parse(state) : null;
  }

  update(columns) {
    window.localStorage.setItem(
      this.key,
      JSON.stringify({
        columns: columns.map((x) => x.serialize())
      })
    );
  }
}

export { LocalStorageStore };
