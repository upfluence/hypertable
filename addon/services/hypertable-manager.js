import Service from '@ember/service';

import Table from '@upfluence/hypertable/types/table';

export default Service.extend({
  createTable(_options = null) {
    return Table.create({ _options });
  }
});
