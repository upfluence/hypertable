import Component from '@ember/component';

import CellRendererMixin from '@upfluence/hypertable/mixins/cell-renderer';
import EditableMixin from '@upfluence/hypertable/mixins/editable';

export default Component.extend(EditableMixin, CellRendererMixin);
