const express = require('express');
const router = express.Router();
const {user} = require('../db');
const {respond} = require('./response');

router.post('/login', (req, res) => {
  respond(res, user.login(req.body.username, req.body.password, res));
});

router.post('/logout', (req, res) => {
  respond(res, user.logout(req.username, req.signedCookies['session-token'], res));
});

router.post('/register', (req, res) => {
  respond(res, user.register(req.body.username, req.body.password));
});

router.get('/identity', (req, res) => {
  respond(res, user.identity(req.username));
});

module.exports.UserController = router;
