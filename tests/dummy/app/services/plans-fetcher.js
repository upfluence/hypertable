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
    data2: 1620563995,
    data3: ['test1', 'test2', 'test3', 'test4']
  }),
  EmberObject.create({
    name: 'Silver',
    price: 195,
    currency: 'EUR',
    usersCount: 1,
    bulkEmailsCount: 100,
    selected: false,
    data1: 'B',
    data2: 1554800754,
    data3: ['test1', 'test2', 'test3', 'test4', 'test5'],
  }),
  EmberObject.create({
    name: 'Gold',
    price: 495,
    currency: 'EUR',
    usersCount: 1,
    bulkEmailsCount: 300,
    selected: false,
    data1: 'C',
    data2: 1365498354,
  }),
  EmberObject.create({
    name: 'Enterprise',
    price: 'Talk to us',
    usersCount: 'Custom',
    bulkEmailsCount: 'Custom',
    selected: false,
    data1: 'D',
    data3: ['test1'],
  })
]);

const DEFAULT_COLUMN_CATEGORIES = [
  {
    key: 'category_1',
    label: 'Category 1'
  },
  {
    key: 'category_2',
    label: 'Category 2'
  }
]

const DEFAULT_COLUMNS = [
  {
    title: 'Plan Name',
    property: 'name',
    type: 'text',
    categories: ['category_1', 'category_2'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Plan Price',
    property: 'price',
    type: 'money',
    currency_key: 'currency',
    categories: ['category_2'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Users Count',
    property: 'usersCount',
    type: 'numeric',
    categories: ['category_1'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Bulk Emails',
    property: 'bulkEmailsCount',
    type: 'numeric',
    categories: ['category_2'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Data 1',
    property: 'data1',
    type: 'text',
    categories: ['category_1'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Data 2',
    property: 'data2',
    type: 'date',
    categories: ['category_2'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Data 3',
    property: 'data3',
    type: 'list',
    categories: ['category_2'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Data 4',
    property: 'data4',
    type: 'numeric',
    categories: ['category_1'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Data 5',
    property: 'data5',
    type: 'numeric',
    categories: ['category_2'],
    hasOrdering: true,
    hasFiltering: true
  },
  {
    title: 'Data 6',
    property: 'data6',
    type: 'numeric',
    categories: ['category_1'],
    hasOrdering: true,
    hasFiltering: true
  },
];

export default Service.extend({
  fetch(columnsLayout) {
    return new Promise((resolve) => {
      let columns = DEFAULT_COLUMNS;
      let columnCategories = DEFAULT_COLUMN_CATEGORIES;

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
            columnCategories: columnCategories
          }
        });
      }, 1500)
    });
  }
});
