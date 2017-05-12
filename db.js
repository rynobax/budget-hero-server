var Datastore = require('nedb');

let dbName = 'data';
if(process.env.NODE_ENV=='test') dbName = 'test';

const db = new Datastore({ filename: 'db/'+dbName+'.db', autoload: true });
const budget = require('./db/budget');
const category = require('./db/category');

module.exports = {
  budget: budget(db),
  category: category(db)
}
