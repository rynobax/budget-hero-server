const bcrypt = require('bcryptjs');

module.exports = function(dynamoose, DBVersion){
  const session = require('./sessionDB')(dynamoose, DBVersion);
  const Schema = dynamoose.Schema;
  const userSchema = new Schema({
    username: {
      type: String,
      hashKey: true,
      required: true,
      uppercase: true
    },
    passwordHash: {
      type: String,
      required: true
    }
  });
  const User = dynamoose.model('User-v'+DBVersion, userSchema);
  
  function getUser(username){
    return new Promise((resolve, reject) => {
      User.get(username, function(err, user){
        console.log('user: ', user);
        if(err) reject(err);
        else resolve(user);
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
      getUser(username).then((user) => {
        if(user == undefined){
          bcrypt.hash(password, 10, (err, hash) => {
            if(err) return reject(err);
            const newUser = new User({
              username: username,
              passwordHash: hash
            });
            newUser.save((err) => {
              if(err) reject(err);
              else resolve({registered: true});
            });
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
      getUser(username).then((user) => {
        if(user == null){
          resolve({
            loggedIn: false,
            error: 'No account with that username exists'
          });
        } else {
          bcrypt.compare(password, user.passwordHash, function(err, matched) {
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
              session.add(username).then((token) => {
                res.cookie('session-token', token, {signed: true});
                res.cookie('unsigned', token);
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

  function logout(token){
    return new Promise((resolve, reject) => {
      session.remove(token).then(() => {
        res.clearCookie('session-token');
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

  function verify(token){
    return new Promise((resolve, reject) => {
      resolve(session.check(token));
    });
  }

  function truncateTable(){
    return new Promise((resolve, reject) => {
      User.scan().exec((err, users) => {
        resolve(Promise.all(users.map((user) => {
          return new Promise((resolve, reject) => {
            user.delete((err) => {
              if(err) reject(err);
              else resolve();
            });
          });
        })))
      })
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
