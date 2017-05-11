const express = require('express');
const router = express.Router();
const {getBudget} = require('../../db');
const {respond} = require('../response');

router.post('/', function (req, res) {
  respond(res, addBudgetItem(req.body.item));
});

router.get('/', function (req, res) {
  respond(res, getBudgetItems());
});

router.put('/', function (req, res) {
  respond(res, updateBudgetItem(req.body.item));
});

router.delete('/:id', function (req, res) {
  respond(res, deleteBudgetItem(req.params.id));
});

module.exports.BudgetController = router;
