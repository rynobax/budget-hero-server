const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const {UserController} = require('./UserController');
const {BudgetController} = require('./BudgetController');
const {user} = require('../db');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser('mysecretkey'));

// cors
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

router.use('/user', UserController);

// Get username of request
router.use('/budget', function (req, res, next) {
  if(!req.signedCookies['session-token']){
    return res.status(401).send('No token included!');
  }
  const username = user.verify(req.signedCookies['session-token']).then((username) => {
    if(username == null){
      res.status(401).send('Invalid or expired token');
      return;
    }
    req.username = username;
    next();
  }).catch((err) => {
    console.log('Error getting request token: ', err);
    return res.status(401).send('Internal Error');
  });
});
router.use('/budget', BudgetController);
router.get('/', (req, res) => {
  res.send('Api Root');
});

module.exports.APIController = router;
