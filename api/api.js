const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const {AuthController} = require('./AuthController');
const {BudgetController} = require('./BudgetController');
const auth = require('../db').auth;

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

router.use('/auth', AuthController);

// Get username of request
router.use('/budget', function (req, res, next) {
  if(!req.signedCookies.token){
    res.status(401).send('No token included!');
    return;
  }
  const username = auth.verify(req.signedCookies.token).then((username) => {
    if(username == null){
      res.status(401).send('Invalid or expired token');
      return;
    }
    req.username = username;
    next();
  });
});
router.use('/budget', BudgetController);
router.get('/', (req, res) => {
  res.send('Api Root');
});

module.exports.APIController = router;
