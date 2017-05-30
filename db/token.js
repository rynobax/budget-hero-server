module.exports = function(Datastore, dbPath){
  const db = new Datastore({ filename: dbPath+'token.db', autoload: true, timestampData: true });
  db.ensureIndex({ fieldName: 'createdAt', expireAfterSeconds: 60 * 60 * 24 });
  const token = {};

  token.add = (username) => {
    return new Promise((resolve, reject) => {
      db.insert({username: username, token: crypto.randomBytes(64).toString('hex')},
        (err, newToken) => {
          if(err){
            reject(err);
          } else {
            resolve(token.token);
          }
        });
    });
  }

  token.check = (tok) => {
    return new Promise((resolve, reject) => {
      db.find({token: tok}, (err, foundTokens) => {
        if(err) {
          console.log('Error in token.check: ', err);
          resolve(null);
        }
        else if(foundTokens.length < 1) resolve(null);
        else resolve(foundTokens.username);
      });
    });
  }

  return token;
}