module.exports = function(Datastore, dbPath){
  const db = new Datastore({ filename: dbPath+'budget.db', autoload: true });
  db.ensureIndex({ fieldName: 'name', unique: true }, function (err) {});

  const budget = {};
  
  budget.getItems = function(){
    return new Promise((resolve, reject) => {
      db.find({}, function (err, items) {
        if(err) reject(err);
        else resolve(
          items.reduce((arr, item) => {
            const category = item.category;
            delete item.category;
            delete item.id;
            for(const addedCategory of arr){
              if(addedCategory.name == category){
                addedCategory.items.push(item);
                return arr;
              }
            }
            arr.push({
              name: category,
              items: [item]
            });
            return arr;
          }, [])
        );
      });
    });
  }

  budget.addItem = function(item){
    return new Promise((resolve, reject) => {
      requiredParams = ['name', 'category', 'period', 'amount'];
      requiredParams.forEach((param) => {
        if(item[param] == undefined) {
          resolve({
            added: false,
            error: 'Missing param: ' + param
          })
          return;
        }
      });
      db.find({name: item.name}, (err, items) => {
        if(err) resolve({
          added: false,
          error: err
        });
        if(items.length > 0){
          resolve({
            added: false,
            error: 'An item of that name already exists'
          })
        } else {
          db.insert(item, function (err, newItem) {
            console.log('err: ', err);
            if(err) reject(err);
            else resolve({
              added: true,
              item: newItem
            });
          });
        }
      });
    });
  }

  budget.updateItem = function(id, item){
    return new Promise((resolve, reject) => {
      db.find({name: item.name}, (err, items) => {
        if(err) resolve({
          updated: false,
          error: err
        });
        if(items.length > 0){
          resolve({
            updated: false,
            error: 'An item of that name already exists'
          })
        } else {
          db.update({_id: id}, item, {}, function (err, numReplaced) {
            if(err) resolve({
              updated: false,
              error: err
            });
            else resolve({
              updated: true
            });
          });
        }
      });
    });
  }

  budget.deleteItem = function(id){
    return new Promise((resolve, reject) => {
      db.remove({_id: id}, function (err, numRemoved) {
        if(err) resolve({
          deleted: false,
          error: err
        });
        else resolve({
          deleted: true
        });
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
