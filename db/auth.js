const bcrypt = require('bcrypt');

module.exports = function(Datastore, dbPath){
  const token = require('./token')(Datastore, dbPath);
  const db = new Datastore({ filename: dbPath+'auth.db', autoload: true });
  db.ensureIndex({ fieldName: 'username', unique: true }, function (err) {});
  
  function getUsers(){
    return new Promise((resolve, reject) => {
      db.find({}, function (err, items) {
        if(err) reject(err);
        else resolve(items);
      });
    });
  }
  
  function getUser(username){
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

  function register(username, password){
    return new Promise((resolve, reject) => {
      const errors = [];

      if(username == undefined || username == null || username == ''){
        errors.push('Username cannot be empty')
      } else if(username.length < 6) {
        errors.push('Username must be at least 6 characters')
      } else if(username.length > 256) {
        errors.push('Username must be less than 256 characters')
      }

      if(password == undefined || password == null || password == ''){
        errors.push('Password cannot be empty')
      } else if(password.length < 6) {
        errors.push('Password must be at least 6 characters')
      } else if(password.length > 256) {
        errors.push('Password must be less than 256 characters')
      }

      if(errors.length > 0) {
        resolve({registered: false, error: errors.join('\n')});
        return;
      }
      
      username = username.toUpperCase();

      getUser(username).then((user) => {
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

  function login(username, password, res){
    return new Promise((resolve, reject) => {
      if(username) username = username.toUpperCase();
      getUser(username).then((user) => {
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
              token.add(username).then((tok) => {
                res.cookie('token', tok, {signed: true});
                res.cookie('unsigned', tok);
                resolve({
                  loggedIn: true
                });
              }).catch((err) => {
                resolve({
                  loggedIn: false,
                  error: err
                });
              });
            }
          });
        }
      });
    });
  }

  function logout(tok){
    return new Promise((resolve, reject) => {
      token.remove(tok).then(() => {
        res.clearCookie('token');
        resolve({
          loggedOut: true
        });
      }).catch((err) => {
        resolve({
          loggedOut: false,
          error: err
        })
      })
    });
  }

  function verify(tok){
    return new Promise((resolve, reject) => {
      resolve(token.check(tok));
    });
  }

  function truncateTable(){
    return new Promise((resolve, reject) => {
      db.remove({}, { multi: true }, function (err, numRemoved) {
        if(err) reject(err);
        else resolve(numRemoved);
      });
    });
  }

  return {
    register: register,
    login: login,
    logout: logout,
    verify: verify,
    truncateTable: truncateTable
  }
}
