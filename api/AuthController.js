const express = require('express');
const router = express.Router();
const {auth} = require('../db');
const {respond} = require('./response');

router.post('/login', (req, res) => {
  respond(res, auth.login(req.body.username, req.body.password));
});

router.post('/logout', (req, res) => {
  respond(res, auth.logout());
});

router.post('/register', (req, res) => {
  respond(res, auth.register(req.body.username, req.body.password));
})

module.exports.AuthController = router;
