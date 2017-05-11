var Datastore = require('nedb');
const db = new Datastore({ filename: 'db/data.db', autoload: true });

const budget = {};

budget.getItems = function(){
  return new Promise((resolve, reject) => {
    db.find({}, function (err, items) {
      if(err) reject(err);
      else resolve(items);
    });
  });
}

budget.addItem = function(item){
  return new Promise((resolve, reject) => {
    db.insert(item, function (err, newItem) {
      if(err) reject(err);
      else resolve(newItem);
    });
  });
}

budget.updateItem = function(id, item){
  return new Promise((resolve, reject) => {
    db.update({_id: id}, item, {}, function (err, numReplaced) {
      if(err) reject(err);
      else resolve(numReplaced);
    });
  });
}

budget.deleteItem = function(id){
  return new Promise((resolve, reject) => {
    db.remove({_id: id}, function (err, numRemoved) {
      if(err) reject(err);
      else resolve(numRemoved);
    });
  });
}

budget.truncateTable = function(){
  return new Promise((resolve, reject) => {
    db.remove({}, function (err, numRemoved) {
      if(err) reject(err);
      else resolve(numRemoved);
    });
  });
}

module.exports = {
  budget: budget
}
