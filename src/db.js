const dynamoose = require('dynamoose');
const budget = require('./db/budgetDB');
const user = require('./db/userDB');
const income = require('./db/incomeDB');

const awsConfig = require('./config.js').aws;

if(process.env.NODE_ENV=='test' || process.env.NODE_ENV=='dev') {
  console.log('using local ddb');
  dynamoose.local();
}
dynamoose.AWS.config.update(awsConfig);
dynamoose.setDefaults({
  create: true, // Create table in DB if it does not exist
  waitForActive: true
});

let DBVersion = '5';
if(process.env.NODE_ENV=='test') DBVersion += '-test';

const budgetDB = budget(dynamoose, DBVersion);
const userDB = user(dynamoose, DBVersion);
const incomeDB = income(dynamoose, DBVersion);

module.exports = {
  budget: budgetDB,
  user: userDB,
  income: incomeDB
}

if(process.env.NODE_ENV=='dev') devInit();
function devInit(){
  console.log('Initializing table for dev');
  budgetDB.truncateTable().then(() => {
    budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Water', amount: '50', period: 'MONTHLY'});
    budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Electrical', amount: '20', period: 'MONTHLY'});
    budgetDB.addItem('rynobax', {category: 'Utilities', name: 'Internet', amount: '75', period: 'MONTHLY'});
    budgetDB.addItem('rynobax', {category: 'Personal', name: 'Spending', amount: '15', period: 'PERCENT'});
    budgetDB.addItem('rynobax', {category: 'Personal', name: 'Saving', amount: '25', period: 'PERCENT'});
  }).catch(console.error);
  userDB.truncateTable().then(() => {
    userDB.register('Rynobax', 'password');
  }).catch(console.error);
}