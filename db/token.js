const crypto = require('crypto');

module.exports = function(Datastore, dbPath){
  const db = new Datastore({ filename: dbPath+'token.db', autoload: true, timestampData: true });
  db.ensureIndex({ fieldName: 'createdAt', expireAfterSeconds: 60 * 60 * 24 * 365 });
  db.ensureIndex({ fieldName: 'token', unique: true }, function (err) {});
  const token = {};

  function isUnique(tok){
    return new Promise((resolve, reject) => {
      db.find({token: tok}, (err, foundTokens) => {
        if(err) reject(err);
        else if(foundTokens.length < 1) resolve(true);
        else resolve(false);
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

  token.add = (username) => {
    return new Promise((resolve, reject) => {
      getUniqueToken().then((tok) => {
        db.update({username: username},
          {username: username, token: tok},
          {upsert: true, returnUpdatedDocs: true},
          (err, numAffected, affected, upsert) => {
          if(err){
            reject(err);
          } else {
            resolve(affected.token);
          }
        });
      }).catch(reject);
    });
  }

  token.check = (tok) => {
    return new Promise((resolve, reject) => {
      db.find({token: tok}, (err, foundTokens) => {
        if(err) reject(err);
        else if(foundTokens.length < 1) resolve(null);
        else resolve(foundTokens[0].username);
      });
    });
  }

  token.remove = (tok) => {
    return new Promise((resolve, reject) => {
      db.remove({token: tok}, (err, numRemoved) => {
          if(err){
            reject(err);
          } else {
            resolve(numRemoved);
          }
        });
    });
  }

  return token;
}