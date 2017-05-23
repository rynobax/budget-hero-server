const Datastore = require('nedb');
const budget = require('./db/budget');

let dbPath = 'nedbFiles/prod/';
if(process.env.NODE_ENV=='test') dbPath = 'nedbFiles/test/';

const budgetDB = budget(Datastore, dbPath);

module.exports = {
  budget: budgetDB
}

if(process.env.NODE_ENV!='test') devInit();
function devInit(){
    budgetDB.truncateTable().then(() => {
      budgetDB.addItem({category: 'Utilities', name: 'Water', amount: '50', type: 'VALUE', period: 'MONTHLY'});
      budgetDB.addItem({category: 'Utilities', name: 'Electrial', amount: '20', type: 'VALUE', period: 'MONTHLY'});
      budgetDB.addItem({category: 'Utilities', name: 'Internet', amount: '75', type: 'VALUE', period: 'MONTHLY'});
      budgetDB.addItem({category: 'Personal', name: 'Spending', amount: '15', type: 'PERCENT'});
      budgetDB.addItem({category: 'Personal', name: 'Saving', amount: '25', type: 'PERCENT'});
    });
}