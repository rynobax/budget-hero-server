const bcrypt = require('bcrypt');

module.exports = function(Datastore, dbPath){
  const tokenDB = require('./token')(Datastore, dbPath);
  const db = new Datastore({ filename: dbPath+'auth.db', autoload: true });
  db.ensureIndex({ fieldName: 'username', unique: true }, function (err) {});
  const auth = {};
  
  
  auth.getUsers = function(){
    return new Promise((resolve, reject) => {
      db.find({}, function (err, items) {
        if(err) reject(err);
        else resolve(items);
      });
    });
  }
  
  auth.getUser = function(username){
    return new Promise((resolve, reject) => {
      db.find({username: username}, function (err, items) {
        if(err) reject(err);
        else {
          if(items.length == 0) resolve(null);
          else resolve(items[0]);
        }
      });
    });
  }

  auth.register = function(username, password){
    return new Promise((resolve, reject) => {
      auth.getUser(username).then((user) => {
        if(user == null){
          bcrypt.hash(password, 10, (err, hash) => {
            if(err) return reject(err);
            const user = {
              username: username,
              hash: hash
            };
            db.insert(user, function (err, newUser) {
              if(err) reject(err);
              else resolve({
                registered: true
              });
            })
          });
        } else {
          resolve({
            registered: false,
            error: 'Account already exists'
          })
        }
      });
    });
  }

  auth.login = function(username, password){
    return new Promise((resolve, reject) => {
      auth.getUser(username).then((user) => {
        if(user == null){
          resolve({
            loggedIn: false,
            error: 'No account with that username exists'
          });
        } else {
          bcrypt.compare(password, user.hash, function(err, matched) {
            if(err){
              resolve({
                loggedIn: false,
                error: err
              });
            } else if(!matched){
              resolve({
                loggedIn: false,
                error: 'Incorrect password'
              });
            } else {
              resolve({
                loggedIn: true
              });
            }
          });
        }
      });
    });
  }

  auth.truncateTable = function(){
    return new Promise((resolve, reject) => {
      db.remove({}, { multi: true }, function (err, numRemoved) {
        if(err) reject(err);
        else resolve(numRemoved);
      });
    });
  }

  return auth;
}
