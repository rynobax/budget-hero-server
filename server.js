const express = require('express');
const morgan = require('morgan');
const {APIController} = require('./api/api');

const app = express();
app.use(morgan('tiny'))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


module.exports.start = function(port) {
  app.use('/api', APIController);
  return app.listen(port, () => {
   console.log('Proxy API listening on port ', port);
  });
}

module.exports.app = app;
