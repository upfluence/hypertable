import { helper } from '@ember/component/helper';

export default helper(([category]: [string]): string => {
  return category.toLowerCase().replace(/\s+/g, '_');
});
