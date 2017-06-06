const path = require('path');

module.exports = {
  entry: './src/lambda.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'lambda.js'
  }
};