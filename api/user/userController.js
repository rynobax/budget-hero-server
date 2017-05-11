const express = require('express');
const router = express.Router();
// ADD THIS PART
// CREATES A NEW USER
router.post('/', function (req, res) {
  res.send('Post User');
});
// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req, res) {
  res.send('Get User');
});

module.exports.UserController = router;
