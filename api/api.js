const express = require('express');
const bodyParser = require('body-parser');
const {UserController} = require('./userController');
const {BudgetController} = require('./budgetController');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use('/user', UserController);
router.use('/budget', BudgetController);
router.get('/', (req, res) => {
  res.send('Api Root');
});

module.exports.APIController = router;
