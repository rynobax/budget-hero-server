const dynamoose = require('dynamoose');
const budget = require('./db/budgetDB');
const user = require('./db/userDB');
const awsConfig = require('./config.js').aws;

if(process.env.NODE_ENV=='test' || process.env.NODE_ENV=='dev') dynamoose.local();
dynamoose.AWS.config.update(awsConfig);
dynamoose.setDefaults({
  create: true, // Create table in DB if it does not exist
  waitForActive: true
});

let DBVersion = '1';
if(process.env.NODE_ENV=='test') DBVersion += '-test';

const budgetDB = budget(dynamoose, DBVersion);
const userDB = user(dynamoose, DBVersion);

module.exports = {
  budget: budgetDB,
  user: userDB
}

if(process.env.NODE_ENV=='dev') devInit();
function devInit(){
    budgetDB.truncateTable().then(() => {
      budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Water', amount: '50', period: 'MONTHLY'});
      budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Electrial', amount: '20', period: 'MONTHLY'});
      budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Internet', amount: '75', period: 'MONTHLY'});
      budgetDB.addItem('rynobax', {category: 'Personal', name: 'Spending', amount: '15', period: 'PERCENT'});
      budgetDB.addItem('rynobax', {category: 'Personal', name: 'Saving', amount: '25', period: 'PERCENT'});
    });
    userDB.truncateTable().then(() => {
      userDB.register('rynobax', 'password');
    });
}