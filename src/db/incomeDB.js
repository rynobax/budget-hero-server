module.exports = function(dynamoose, DBVersion){
  const Schema = dynamoose.Schema;
  const incomeSchema = new Schema({
    username: {
      type: String,
      hashKey: true,
      required: true,
      uppercase: true
    },
    amount: {
      type: Number,
      required: true
    },
    period: {
      type: String,
      required: true,
      uppercase: true
    }
  });
  const Income = dynamoose.model('Income-v'+DBVersion, incomeSchema);

  function add(username){
    return new Promise((resolve, reject) => {
      const newIncome = new Income({username: username, amount: 0, period: 'Yearly'});
      newIncome.save((err) => {
        if(err) reject(err);
        else resolve();
      });
    });
  }

  function update(username, amount, period){
    return new Promise((resolve, reject) => {
      Income.update({username: username}, {amount: amount, period: period}, (err) => {
        if(err) reject({updated: false, error: err});
        else resolve({
          updated: true
        });
      });
    });
  }

  function get(username){
    return new Promise((resolve, reject) => {
      Income.get({username: username}, (err, income) => {
        if(err) reject({error: err});
        else resolve({
          income: income
        });
      });
    });
  }

  return {
    add: add,
    update: update,
    get: get
  };
}