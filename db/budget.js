module.exports = function(Datastore, dbPath){
  const db = new Datastore({ filename: dbPath+'budget.db', autoload: true });
  db.ensureIndex({ fieldName: 'name', unique: true }, function (err) {});

  const budget = {};
  
  budget.getItems = function(){
    return new Promise((resolve, reject) => {
      db.find({}, function (err, items) {
        if(err) reject(err);
        else resolve(items);
      });
    });
  }
  
  budget.getItemsOfCategory = function(categoryId){
    return new Promise((resolve, reject) => {
      db.find({category: categoryId}, function (err, items) {
        if(err) reject(err);
        else resolve(items);
      });
    });
  }

  budget.addItem = function(item){
    return new Promise((resolve, reject) => {
      if(item.name == '' || item.name == undefined){
        reject('Name required');
      }
      if(item.category == '' || item.category == undefined){
        reject('Category required');
      }
      db.insert(item, function (err, newItem) {
        if(err) reject(err);
        else resolve(newItem);
      });
    });
  }

  budget.updateItem = function(id, item){
    return new Promise((resolve, reject) => {
      if(item.name == '' || item.name == undefined){
        reject('Name required');
      }
      if(item.category == '' || item.category == undefined){
        reject('Category required');
      }
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
      db.remove({}, { multi: true }, function (err, numRemoved) {
        if(err) reject(err);
        else resolve(numRemoved);
      });
    });
  }

  return budget;
}
