const express = require('express');
const router = express.Router();
const {budget} = require('../db');
const {respond} = require('./response');

router.post('/', function (req, res) {
  respond(res, budget.addItem(req.username, req.body));
});

router.get('/', function (req, res) {
  respond(res, budget.getItems(req.username));
});

router.put('/:id', function (req, res) {
  respond(res, budget.updateItem(req.username, req.params.id, req.body));
});

router.delete('/:id', function (req, res) {
  respond(res, budget.deleteItem(req.username, req.params.id));
});

module.exports.BudgetController = router;
