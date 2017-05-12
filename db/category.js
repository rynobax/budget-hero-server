module.exports = function(Datastore, dbPath, budgetDB){
  const db = new Datastore({ filename: dbPath+'category.db', autoload: true });
  db.ensureIndex({ fieldName: 'name', unique: true }, function (err) {});

  const category = {};

  category.NO_CATEGORY_NAME = 'No Category';
  
  category.getItem = function(id){
    return new Promise((resolve, reject) => {
      db.find({_id: id}, function (err, items) {
        if(err) reject(err);
        else resolve(items[0]);
      });
    });
  }
  
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
      if(item.name == category.NO_CATEGORY_NAME){
        reject('Reserved name');
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
      db.remove({_id: id}, function (err, numRemoved) {
        if(err) reject(err);
        else{
          budgetDB.cleanDeadCategory(id).then(() =>{
            resolve(numRemoved);
          })
          .catch(reject);
        }
      });
    });
  }

  category.truncateTable = function(){
    return new Promise((resolve, reject) => {
      db.remove({}, function (err, numRemoved) {
        if(err) reject(err);
        else resolve(numRemoved);
      });
    });
  }
  
  function testInit() {
    const categories = [];
    categories.push({name: 'Utilities'});
    categories.push({name: 'Food'});
    categories.push({name: 'Luxery'});
    category.truncateTable().then(() => {
      categories.forEach((e) => {
        category.addItem(e);
      });
    });
  }
  testInit();
  
  return category;
}
