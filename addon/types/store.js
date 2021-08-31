class LocalStorageStore {
  constructor(storageKey) {
    this.key = storageKey;
  }

  getState() {
    const state = window.localStorage.getItem(this.key);
    return state ? JSON.parse(state) : null;
  }

  update(columns, fields) {
    window.localStorage.setItem(
      this.key,
      JSON.stringify({
        columns: this._removeManager(columns),
        fields: this._removeManager(fields)
      })
    );
  }

  _removeManager(collection) {
    return collection.map((x) => {
      delete x.manager;
      return x;
    });
  }
}

export { LocalStorageStore };
