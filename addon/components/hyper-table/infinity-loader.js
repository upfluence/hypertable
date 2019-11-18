import Component from '@ember/component';
import InViewportMixin from 'ember-in-viewport';

export default Component.extend(InViewportMixin, {
  classNames: ['hypertable__infinity-loader'],

  didEnterViewport() {
    this.onBottomReached();
  },
});
