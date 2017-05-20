const Datastore = require('nedb');
const budget = require('./db/budget');
const category = require('./db/category');

let dbPath = 'db/prod/';
if(process.env.NODE_ENV=='test') dbPath = 'db/test/';

const budgetDB = budget(Datastore, dbPath);
const categoryDB = category(Datastore, dbPath, budgetDB);

module.exports = {
  budget: budgetDB,
  category: categoryDB
}

if(process.env.NODE_ENV!='test') devInit();
function devInit(){
  Promise.all([categoryDB.truncateTable(), budgetDB.truncateTable()]).then((res) => {
    categoryDB.addItem({name: 'Utilities'}).then(e => {
      const id = e._id;
      budgetDB.addItem({category: id, name: 'Water', amount: '50', type: 'VALUE', period: 'MONTHLY'});
      budgetDB.addItem({category: id, name: 'Electrial', amount: '20', type: 'VALUE', period: 'MONTHLY'});
      budgetDB.addItem({category: id, name: 'Internet', amount: '75', type: 'VALUE', period: 'MONTHLY'});
    });
    categoryDB.addItem({name: 'Personal'}).then(e => {
      const id = e._id;
      budgetDB.addItem({category: id, name: 'Spending', amount: '15', type: 'PERCENT'});
      budgetDB.addItem({category: id, name: 'Saving', amount: '25', type: 'PERCENT'});
    });
  });
}