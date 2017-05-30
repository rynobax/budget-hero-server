module.exports = function(Datastore, dbPath){
  const db = new Datastore({ filename: dbPath+'token.db', autoload: true, timestampData: true });
  db.ensureIndex({ fieldName: 'createdAt', expireAfterSeconds: 60 * 60 * 24 * 365 });
  const token = {};

  token.add = (username) => {
    return new Promise((resolve, reject) => {
      db.update({username: username},
        {username: username, token: require('crypto').randomBytes(64).toString('hex')},
        {upsert: true, returnUpdatedDocs: true},
        (err, numAffected, affected, upsert) => {
          const newToken = affected || upsert || affected[0];
          if(err){
            reject(err);
          } else {
            resolve(newToken.token);
          }
        });
    });
  }

  token.check = (tok) => {
    return new Promise((resolve, reject) => {
      db.find({token: tok}, (err, foundTokens) => {
        if(err) reject(err);
        else if(foundTokens.length < 1) resolve(null);
        else resolve(foundTokens.username);
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