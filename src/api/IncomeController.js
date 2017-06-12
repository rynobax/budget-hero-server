const express = require('express');
const router = express.Router();
const {income} = require('../db');
const {respond} = require('./response');

router.get('/', (req, res) => {
  respond(res, income.get(req.username));
});

router.put('/', (req, res) => {
  respond(res, income.update(req.username, req.body.income.amount, req.body.income.period));
});

module.exports.IncomeController = router;
