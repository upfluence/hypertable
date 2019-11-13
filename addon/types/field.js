import EmberObject from '@ember/object';

export default EmberObject.extend({
  key: null,
  categories: null,
  name: null,
  iconPrefix: null,
  visible: false,
  toggleable: true
});
