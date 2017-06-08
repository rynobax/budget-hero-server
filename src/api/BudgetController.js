const express = require('express');
const router = express.Router();
const {budget} = require('../db');
const {respond} = require('./response');

router.post('/', function (req, res) {
  respond(res, budget.addItem(req.username, req.body.item));
});

router.get('/', function (req, res) {
  respond(res, budget.getItems(req.username));
});

router.put('/', function (req, res) {
  respond(res, budget.updateItem(req.username, req.body.item));
});

router.delete('/', function (req, res) {
  respond(res, budget.deleteItem(req.username, req.body.id));
});

module.exports.BudgetController = router;
