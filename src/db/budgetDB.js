module.exports = function(dynamoose, DBVersion){
  const Schema = dynamoose.Schema;
  const budgetSchema = new Schema({
    category: {
      type: String,
      uppercase: true,
      trim: true,
      required: true
    },
    categoryPretty: {
      type: String,
      trim: true,
      required: true
    },
    name: {
      type: String,
      uppercase: true,
      trim: true,
      required: true
    },
    namePretty: {
      type: String,
      trim: true,
      required: true
    },
    id: {
      type: String,
      required: true,
      hashKey: true
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
      rangeKey: true
    }
  });

  const BudgetItem = dynamoose.model('BudgetItem-v'+DBVersion, budgetSchema);

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
      BudgetItem.scan('username').eq(username).exec((err, budgetItems) => {
        if(err) reject(err);
        else resolve(
          {items: budgetItems.map((item) => {
            item.category = item.categoryPretty;
            delete item.categoryPretty;
            item.name = item.namePretty;
            delete item.namePretty;
            return item;
          })}
        );
      });
    });
  }

  function addItem(username, item){
    return new Promise((resolve, reject) => {
      const errors = validateParams(item, ['name', 'category', 'amount', 'period']);
      if(errors.length > 0) {
        return resolve({added: false, error: errors.join('\n')});
      }
      const hrTime=process.hrtime();
      const id = username + (hrTime[0] * 1000000000 + hrTime[1]);
      item = Object.assign(item, {
        username: username,
        id: id,
        categoryPretty: item.category,
        namePretty: item.name
      });
      const newItem = new BudgetItem(item);
      BudgetItem.scan('username').eq(newItem.username)
        .where('name').eq(newItem.name)
        .exec((err, existingItem) => {
          if(err) reject({added: false, error: err});
          else newItem.save((err) => {
            if(err) reject({added: false, error: err});
            else resolve({added: true, item: item});
          })
      });
    });
  }

  function updateItem(username, item){
    const id = item.id;
    delete item.id;
    return new Promise((resolve, reject) => {
      const errors = validateParams(item, ['name', 'category', 'amount', 'period']);
      if(errors.length > 0) {
        resolve({updated: false, error: errors.join('\n')});
        return;
      }
      BudgetItem.scan('username').eq(username)
        .where('name').eq(item.name)
        .exec((err, items) => {
          if(err) reject({updated: false, error: err});
          else {
            if(items.length > 0 && items[0].id != id){
              resolve({updated: false, error: 'An item of that name already exists'});
            }else{
              BudgetItem.update({username: username, id: id}, item, (err) => {
                if(err) reject({updated: false, error: err});
                else resolve({updated: true});
              });
            };
        };
      });
    });
  }

  function deleteItem(username, id){
    if(id == undefined || id == null){
      resolve({deleted: false, error: 'No id'})
    }
    return new Promise((resolve, reject) => {
      BudgetItem.delete({username: username, id: id}, (err) => {
        if(err) resolve({deleted: false, error: err});
        else resolve({deleted: true});
      });
    });
  }

  function truncateTable(){
    return new Promise((resolve, reject) => {
      BudgetItem.scan().exec((err, budgetItems) => {
        resolve(Promise.all(budgetItems.map((budgetItem) => {
          return new Promise((resolve, reject) => {
            budgetItem.delete((err) => {
              if(err) reject(err);
              else resolve();
            });
          });
        })))
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
