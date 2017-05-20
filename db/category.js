module.exports = function(Datastore, dbPath, budgetDB){
  const db = new Datastore({ filename: dbPath+'category.db', autoload: true });
  db.ensureIndex({ fieldName: 'name', unique: true }, function (err) {});

  const category = {};
  
  category.getItems = function(){
    return new Promise((resolve, reject) => {
      db.find({}, function (err, items) {
        if(err) reject(err);
        else resolve(items);
      });
    });
  }

  category.addItem = function(item){
    return new Promise((resolve, reject) => {
      if(item.name == ''){
        reject('Name required');
      }
      db.insert(item, function (err, newItem) {
        if(err) reject(err);
        else resolve(newItem);
      });
    });
  }

  category.updateItem = function(id, item){
    return new Promise((resolve, reject) => {
      if(item.name == ''){
        reject('Name required');
      }
      if(item.name == category.NO_CATEGORY_NAME){
        reject('Reserved name');
      }
      db.update({_id: id}, item, {}, function (err, numReplaced) {
        if(err) reject(err);
        else resolve(numReplaced);
      });
    });
  }

  category.deleteItem = function(id){
    return new Promise((resolve, reject) => {
      budgetDB.getItemsOfCategory(id)
        .then((items) => {
          if(items.length == 0){
            db.remove({_id: id}, function (err, numRemoved) {
              if(err) reject(err);
              else resolve(numRemoved);
            });
          } else {
            reject('Category not empty');
          }
        })
        .catch(reject);
    });
  }

  category.truncateTable = function(){
    return new Promise((resolve, reject) => {
      db.remove({}, { multi: true }, function (err, numRemoved) {
        if(err) reject(err);
        else resolve(numRemoved);
      });
    });
  }
  
  return category;
}
