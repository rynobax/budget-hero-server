const express = require('express');
const bodyParser = require('body-parser');
const {UserController} = require('./user/userController');
const {BudgetController} = require('./budget/budgetController');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use('/user', UserController);
router.use('/budget', BudgetController);
router.get('/', (req, res) => {
  res.send('Api Root');
});

module.exports.APIController = router;
