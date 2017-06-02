const dynamoose = require('dynamoose');
const budget = require('./db/budget');
const auth = require('./db/auth');

dynamoose.local();
dynamoose.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-east-1'
});
dynamoose.setDefaults({
  create: true, // Create table in DB if it does not exist
  waitForActive: true
});

const budgetDB = budget(dynamoose);
const authDB = auth(dynamoose);

module.exports = {
  budget: budgetDB,
  auth: authDB
}

if(process.env.NODE_ENV!='test') devInit();
function devInit(){
    budgetDB.truncateTable().then(() => {
      budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Water', amount: '50', period: 'MONTHLY'});
      budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Electrial', amount: '20', period: 'MONTHLY'});
      budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Internet', amount: '75', period: 'MONTHLY'});
      budgetDB.addItem('rynobax', {category: 'Personal', name: 'Spending', amount: '15', period: 'PERCENT'});
      budgetDB.addItem('rynobax', {category: 'Personal', name: 'Saving', amount: '25', period: 'PERCENT'});
    });
    authDB.truncateTable().then(() => {
      authDB.register('rynobax', 'password');
    });
}