import { A } from '@ember/array';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { isEmpty } from '@ember/utils';

const MOCK_DATA = A([
  EmberObject.create({
    name: 'Bronze',
    price: 99,
    currency: 'EUR',
    usersCount: 1,
    bulkEmailsCount: 0,
    selected: false,
    data1: 'A',
    data2: 1620563995
  }),
  EmberObject.create({
    name: 'Silver',
    price: 195,
    currency: 'EUR',
    usersCount: 1,
    bulkEmailsCount: 100,
    selected: false,
    hovered: false,
    data1: 'B',
    data2: 1554800754
  }),
  EmberObject.create({
    name: 'Gold',
    price: 495,
    currency: 'EUR',
    usersCount: 1,
    bulkEmailsCount: 300,
    selected: false,
    hovered: false,
    data1: 'C',
    data2: 1365498354
  }),
  EmberObject.create({
    name: 'Enterprise',
    price: 'Talk to us',
    usersCount: 'Custom',
    bulkEmailsCount: 'Custom',
    selected: false,
    hovered: false,
    data1: 'D',
    data2: 1383987954
  })
]);

const DEFAULT_GROUPS = [
  {
    type: 'group_1',
    label: 'Group 1'
  },
  {
    type: 'group_2',
    label: 'Group 2'
  }
]

const DEFAULT_COLUMNS = [
  {
    title: 'Plan Name',
    property: 'name',
    type: 'text',
    group: 'group_1'
  },
  {
    title: 'Plan Price',
    property: 'price',
    type: 'money',
    currency_key: 'currency',
    group: 'group_2'
  },
  {
    title: 'Users Count',
    property: 'usersCount',
    type: 'numeric',
    group: 'group_1'
  },
  {
    title: 'Bulk Emails',
    property: 'bulkEmailsCount',
    type: 'numeric',
    group: 'group_2'
  },
  {
    title: 'Data 1',
    property: 'data1',
    type: 'text',
    group: 'group_1'
  },
  {
    title: 'Data 2',
    property: 'data2',
    type: 'date',
    group: 'group_2'
  },
  {
    title: 'Data 3',
    property: 'data3',
    type: 'numeric',
    group: 'group_2'
  },
  {
    title: 'Data 4',
    property: 'data4',
    type: 'numeric',
    group: 'group_1'
  },
  {
    title: 'Data 5',
    property: 'data5',
    type: 'numeric',
    group: 'group_2'
  },
  {
    title: 'Data 6',
    property: 'data6',
    type: 'numeric',
    group: 'group_1'
  },
];

export default Service.extend({
  fetch(columnsLayout) {
    return new Promise((resolve, reject) => {
      let columns = DEFAULT_COLUMNS;
      let groups = DEFAULT_GROUPS;

      let data = A(
        MOCK_DATA.concat(MOCK_DATA).concat(MOCK_DATA).concat(MOCK_DATA)
      );

      if (columnsLayout) {
        columns = columnsLayout;
        window.sessionStorage.setItem('columns', JSON.stringify(columns));
      } else if (!columnsLayout && window.sessionStorage.getItem('columns')) {
        columns = JSON.parse(window.sessionStorage.getItem('columns'));
      }

      let orderedColumn = columns.find((x) => !isEmpty(x.orderBy));

      let filteredColumn = columns.find((x) => x.filters && x.filters.find((y)=> y.type == 'search'));

      if (orderedColumn) {
        data = data.sortBy(orderedColumn.property);

        if (orderedColumn.orderDirection === 'desc') {
          data.reverse();
        }
      }

      if (filteredColumn) {
        let searchFilter = filteredColumn.filters.find(x => !isEmpty(x.value));
        if(searchFilter){
          let searchRegex = RegExp(searchFilter.value.term, 'i');

          data = data.filter(
            column => column[filteredColumn.property].match(searchRegex)
          );
        }
      }

      setTimeout(() => {
        resolve({
          items: data,
          meta: {
            columns: columns,
            groups: groups
          }
        });
      }, 1500)
    });
  }
});
