const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const {UserController} = require('./api/UserController');
const {BudgetController} = require('./api/BudgetController');
const {IncomeController} = require('./api/IncomeController');
const {user} = require('./db');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser('mysecretkey'));

// cors
router.use(function(req, res, next) {
  console.log('req host: ', req.host);
  console.log('req headers: ', req.headers.rawHeaders);
  console.log('req body: ', req.body);
  if(process.env.NODE_ENV=='test' || process.env.NODE_ENV=='dev'){
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  }else {
    res.header("Access-Control-Allow-Origin", "https://rynobax.github.io");
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

router.use(function(req, res, next) {
  if(req.signedCookies['session-token']){
    user.verify(req.signedCookies['session-token'])
      .then((username) => {
        if(username == null){
          res.clearCookie('session-token');
        }
        req.username = username;
        next();
      })
      .catch(console.error);
  }else {
    next();
  }
})

router.use('/user', UserController);
router.use('/budget', BudgetController);
router.use('/income', IncomeController);
router.get('/', (req, res) => {
  res.send('Api Root');
});

module.exports.APIController = router;
