module.exports = function(db){
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
      db.insert(item, function (err, newItem) {
        if(err) reject(err);
        else resolve(newItem);
      });
    });
  }

  category.updateItem = function(id, item){
    return new Promise((resolve, reject) => {
      db.update({_id: id}, item, {}, function (err, numReplaced) {
        if(err) reject(err);
        else resolve(numReplaced);
      });
    });
  }

  // TODO: Make sure budgets using this categories are gucci
  category.deleteItem = function(id){
    return new Promise((resolve, reject) => {
      db.remove({_id: id}, function (err, numRemoved) {
        if(err) reject(err);
        else resolve(numRemoved);
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
  
  return cateogry;
}
