import Service from '@ember/service';

import Table from '@upfluence/hypertable/types/table';

export default class Manager extends Service {
  createTable(_options = null, hooks = {}) {
    return Table.create({ _options, hooks });
  }
}
