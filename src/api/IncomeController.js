const express = require('express');
const router = express.Router();
const {income} = require('../db');
const {respond} = require('./response');

router.get('/', (req, res) => {
  respond(res, income.get(req.username));
});

router.put('/', (req, res) => {
  respond(res, income.update(req.username, req.body.amount, req.body.period));
});

module.exports.IncomeController = router;
