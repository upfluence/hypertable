import Component from '@ember/component';
import InViewportMixin from 'ember-in-viewport';

export default Component.extend(InViewportMixin, {
  classNames: ['hypertable__infinity-loader'],

  triggerOffset: 0, // offset from bottom of target and viewport

  init() {
    this._super();

    this.setProperties({
      viewportSpy: true,
      viewportTolerance: {
        top: 0,
        right: 0,
        bottom: this.triggerOffset,
        left: 0
      }
    });
  },

  didEnterViewport() {
    this.onBottomReached();
  }
});
