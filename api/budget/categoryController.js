const express = require('express');
const router = express.Router();
const {category} = require('../../db');
const {respond} = require('../response');

router.post('/', function (req, res) {
  respond(res, category.addItem(req.body));
});

router.get('/', function (req, res) {
  respond(res, category.getItems());
});

router.put('/:id', function (req, res) {
  respond(res, category.updateItem(req.params.id, req.body));
});

router.delete('/:id', function (req, res) {
  respond(res, category.deleteItem(req.params.id));
});

module.exports.CategoryController = router;
