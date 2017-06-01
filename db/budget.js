module.exports = function(Datastore, dbPath){
  const db = new Datastore({ filename: dbPath+'budget.db', autoload: true });

  const budget = {};

  function validateParams(item){
    const requiredParams = ['name', 'category', 'amount', 'period'];
    const errors = [];
    requiredParams.forEach((param) => {
      if(item[param] == undefined) {
        errors.push('Missing paramameter ' + param);
      }
      else if(item[param] == '') {
        errors.push(param + ' cannot be empty');
      }
    });
    return errors;
  }
  
  budget.getItems = function(username){
    return new Promise((resolve, reject) => {
      username = username.toUpperCase();
      db.find({username: username}, function (err, items) {
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

  budget.addItem = function(username, item){
    return new Promise((resolve, reject) => {
      const errors = validateParams(item);
      if(errors.length > 0) {
        resolve({added: false, error: errors.join('\n')});
        return;
      }
      username = username.toUpperCase();
      db.find({username: username, name: item.name}, (err, items) => {
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
          item = Object.assign({}, item, {username: username});
          db.insert(item, function (err, newItem) {
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

  budget.updateItem = function(username, id, item){
    return new Promise((resolve, reject) => {
      const errors = validateParams(item);
      if(errors.length > 0) {
        resolve({updated: false, error: errors.join('\n')});
        return;
      }
      username = username.toUpperCase();
      db.find({username: username, name: item.name}, (err, items) => {
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
          item = Object.assign({}, item, {username: username});
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

  budget.deleteItem = function(username, id){
    return new Promise((resolve, reject) => {
      username = username.toUpperCase();
      db.remove({username: username, _id: id}, function (err, numRemoved) {
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
