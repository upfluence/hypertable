import Service from '@ember/service';

import Table from '@upfluence/hypertable/types/table';

export default Service.extend({
  createTable(_options = null, hooks = {}) {
    return Table.create({ _options }, hooks);
  }
});
