const Datastore = require('nedb');
const budget = require('./db/budget');
const auth = require('./db/auth');

let dbPath = 'nedbFiles/prod/';
if(process.env.NODE_ENV=='test') dbPath = 'nedbFiles/test/';

const budgetDB = budget(Datastore, dbPath);
const authDB = auth(Datastore, dbPath);

module.exports = {
  budget: budgetDB,
  auth: authDB
}

if(process.env.NODE_ENV!='test') devInit();
function devInit(){
    budgetDB.truncateTable().then(() => {
      budgetDB.addItem({category: 'Utilities', name: 'Water', amount: '50', period: 'MONTHLY'});
      budgetDB.addItem({category: 'Utilities', name: 'Electrial', amount: '20', period: 'MONTHLY'});
      budgetDB.addItem({category: 'Utilities', name: 'Internet', amount: '75', period: 'MONTHLY'});
      budgetDB.addItem({category: 'Personal', name: 'Spending', amount: '15', period: 'PERCENT'});
      budgetDB.addItem({category: 'Personal', name: 'Saving', amount: '25', period: 'PERCENT'});
    });
}