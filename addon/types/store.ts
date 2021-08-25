type Column = {
  manager: any;
};

interface Store {
  getState(): Promise<Array<Column> | null>;
  updateState(columns: Array<Column>): Promise<Array<Column> | null>;
}

class NoOpStore implements Store {
  getState() {
    return Promise.resolve(null);
  }

  updateState(_: Array<Column> = []) {
    return Promise.resolve(null);
  }
}

class LocalStorageStore implements Store {
  private key: string;

  constructor(storageKey: string) {
    this.key = storageKey;
  }

  getState() {
    const state = window.localStorage.getItem(this.key);
    return Promise.resolve(state ? JSON.parse(state) : null);
  }

  updateState(columns: Array<Column>) {
    window.localStorage.setItem(
      this.key,
      JSON.stringify(
        columns.map((x) => {
          delete x.manager;
          return x;
        })
      )
    );
    return Promise.resolve(null);
  }
}

export { NoOpStore };
export { LocalStorageStore };
