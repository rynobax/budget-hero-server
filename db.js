var Datastore = require('nedb');
const db = new Datastore({ filename: 'db/data.db', autoload: true });

module.exports.getBudgetItems = function(){
  return new Promise((resolve, reject) => {
    db.find({}, function (err, items) {
      if(err) reject(err);
      else resolve(items);
    });
  });
}

module.exports.addBudgetItem = function(item){
  return new Promise((resolve, reject) => {
    db.insert(item, function (err, newItem) {
      if(err) reject(err);
      else resolve(newItem);
    });
  });
}

module.exports.updateBudgetItem = function(item){
  return new Promise((resolve, reject) => {
    db.update({_id: item._id}, item, {}, function (err, numReplaced) {
      if(err) reject(err);
      else resolve(numReplaced);
    });
  });
}

module.exports.deleteBudgetItem = function(id){
  return new Promise((resolve, reject) => {
    db.remove({_id: id}, function (err, numRemoved) {
      if(err) reject(err);
      else resolve(numRemoved);
    });
  });
}
