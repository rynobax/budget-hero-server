var Datastore = require('nedb');
const db = new Datastore({ filename: 'db/data.db', autoload: true });
const budget = require('./db/budget');
const category = require('./db/category');

module.exports = {
  budget: budget(db),
  category: category(db)
}
