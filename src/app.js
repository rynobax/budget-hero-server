const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const {APIController} = require('./api');

const app = express();
if(process.env.NODE_ENV=='dev') app.use(morgan('tiny'))

app.use('/api', APIController);

module.exports.start = function(port) {
  return app.listen(port, () => {
   console.log('API listening on port ' + port);
  });
}

module.exports.app = app;
