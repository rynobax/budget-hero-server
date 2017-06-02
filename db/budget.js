module.exports = function(dynamoose){
  const Schema = dynamoose.Schema;
  const budgetSchema = new Schema({
    category: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
      rangeKey: true
    },
    name: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
      rangeKey: true
    },
    amount: {
      type: Number,
      required: true
    },
    period: {
      type: String,
      required: true
    },
    username: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
      hashKey: true
    },
    income: {
      type: Boolean,
      rangeKey: true
    }
  });

  const BudgetItem = dynamoose.model('BudgetItem', budgetSchema);

  function validateParams(item, requiredParams){
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

  function getItems(username){
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

  function addItem(username, item){
    return new Promise((resolve, reject) => {
      const errors = validateParams(item, ['name', 'category', 'amount', 'period']);
      if(errors.length > 0) {
        resolve({added: false, error: errors.join('\n')});
        return;
      }
      item = Object.assign(item, {username: username});
      const newItem = BudgetItem(item);
      console.log('newItem.username: ', newItem.username);
      BudgetItem.get({username: item.username.toUpperCase(), name: item.name.toUpperCase()}, (err, existingItem) => {
        if(err) { console.log(err); return reject(err); }
        console.log('existingItem: ', existingItem);
        newItem.save((err) => {
          if(err) { console.log(err); return reject(err); }
          else resolve({added: true, item: item});
        })
      });
    });
  }

  function updateItem(username, id, item){
    return new Promise((resolve, reject) => {
      const errors = validateParams(item, ['name', 'category', 'amount', 'period']);
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

  function deleteItem(username, id){
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

  function truncateTable(){
    return new Promise((resolve, reject) => {
      dynamoose.ddb().deleteTable({TableName: 'BudgetItem'}, (err, data) => {
        if(err) reject(err);
        else resolve(data);
      })
    });
  }

  return {
    getItems: getItems,
    addItem: addItem,
    updateItem: updateItem,
    deleteItem: deleteItem,
    truncateTable: truncateTable
  }
}
