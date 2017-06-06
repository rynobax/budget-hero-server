const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const {APIController} = require('./api/api');

const app = express();
if(process.env.NODE_ENV=='dev') app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api', APIController);

module.exports.start = function(port) {
  return app.listen(port, () => {
   console.log('API listening on port ' + port);
  });
}

module.exports.app = app;
