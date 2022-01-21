import { helper } from '@ember/component/helper';

export function arrayIncludes(params: any[]) {
  const [collection, item] = params;
  return collection.includes(item);
}

export default helper(arrayIncludes);
