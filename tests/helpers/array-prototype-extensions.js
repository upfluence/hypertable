import { A } from '@ember/array';

// The classic hyper-table code relies on the Ember array prototype extensions that apps enable; the dummy app disables them.
// The mixin is not applied to Array.prototype itself so that it leaves no trace on A() once the tests are done.
export function extendArrayPrototype(hooks) {
  const added = [];

  hooks.before(function () {
    const sample = A([]);

    Object.getOwnPropertyNames(sample)
      .filter((name) => name !== 'length' && !(name in Array.prototype))
      .forEach((name) => {
        Object.defineProperty(Array.prototype, name, {
          ...Object.getOwnPropertyDescriptor(sample, name),
          configurable: true
        });
        added.push(name);
      });
  });

  hooks.after(function () {
    added.forEach((name) => delete Array.prototype[name]);
  });
}
