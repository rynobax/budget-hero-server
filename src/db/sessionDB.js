const crypto = require('crypto');

module.exports = function(dynamoose, DBVersion){
  const Schema = dynamoose.Schema;
  const sessionSchema = new Schema({
    username: {
      type: String,
      hashKey: true,
      required: true,
      uppercase: true
    },
    token: {
      type: String,
      rangeKey: true,
      required: true
    }
  });
  const Session = dynamoose.model('Session-v'+DBVersion, sessionSchema);

  function isUnique(token){
    return new Promise((resolve, reject) => {
      Session.scan('token').eq(token).exec((err, foundToken) => {
        if(err) reject(err);
        else {
          if(foundToken.length == 0) resolve(true);
          else resolve(false);
        }
      });
    });
  }

  function getUniqueToken(){
    return new Promise((resolve, reject) => {
      let token = crypto.randomBytes(64).toString('hex');
      isUnique(token).then((isUnique) => {
        if(isUnique) resolve(token);
        else resolve(getUniqueToken());
      });
    });
  }

  function add(username){
    return new Promise((resolve, reject) => {
      getUniqueToken().then((token) => {
        const newSession = new Session({username: username, token: token});
        newSession.save((err) => {
          if(err) reject(err);
          else resolve(newSession.token);
        });
      }).catch(reject);
    });
  }

  function check(token){
    return new Promise((resolve, reject) => {
      Session.scan('token').eq(token).exec((err, res) => {
        if(err) reject(err);
        else {
          if(res.length == 0) resolve(null);
          else resolve(res[0].username);
        }
      });
    });
  }

  function remove(token){
    return new Promise((resolve, reject) => {
      Session.delete({token: token}, (err) => {
        if(err) reject(err);
        else resolve();
      });
    });
  }

  return {
    add: add,
    check: check,
    remove: remove
  };
}