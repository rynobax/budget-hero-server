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