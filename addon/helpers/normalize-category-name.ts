import { helper } from '@ember/component/helper';

export function normalizeCategoryNameHelper(params: any[]) {
  const [category] = params;
  return category.toLowerCase().replace(/\s+/g, '_');
}

export default helper(normalizeCategoryNameHelper);
