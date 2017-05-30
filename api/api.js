const express = require('express');
const bodyParser = require('body-parser');
const {AuthController} = require('./AuthController');
const {BudgetController} = require('./BudgetController');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use('/auth', AuthController);
router.use('/budget', BudgetController);
router.get('/', (req, res) => {
  res.send('Api Root');
});

module.exports.APIController = router;
