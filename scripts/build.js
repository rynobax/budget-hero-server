const ncp = require('ncp').ncp;
const webpack = require("webpack");
const path = require('path');
const replace = require('replace');
const rimraf = require('rimraf');

function clone(){
  console.log('Cloning source files');
  return new Promise((resolve, reject) => {
    ncp('./src', './tmp', function (err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      resolve();
    });
  });
}

function changeConfig(){
  console.log('Updating config');
  // Grabs vars from Travis and populates config file
  if(!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION){
    console.log('Missing an envirmental variable');
    process.exit(1);
  }
  return new Promise((resolve, reject) => {
    replace({
      regex: "accessKeyId: 'AKID'",
      replacement: "accessKeyId: '" + process.env.AWS_ACCESS_KEY_ID + "'",
      paths: ['./tmp'],
      recursive: true,
      silent: true,
    });
    replace({
      regex: "secretAccessKey: 'SECRET'",
      replacement: "secretAccessKey: '" + process.env.AWS_SECRET_ACCESS_KEY + "'",
      paths: ['./tmp'],
      recursive: true,
      silent: true,
    });
    replace({
      regex: "region: 'us-east-1'",
      replacement: "region: '" + process.env.AWS_REGION + "'",
      paths: ['./tmp'],
      recursive: true,
      silent: true,
    });
    resolve();
  });
}

function pack(){
  console.log('Calling webpack');
  return new Promise((resolve, reject) => {
    // returns a Compiler instance
    webpack({
      entry: './tmp/lambda.js',
      target: 'node',
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'lambda.js'
      }
    }, (err, stats) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      resolve();
    });
  });
}

function deleteTmp(){
  console.log('Deleting tmp dir');
  return new Promise((resolve, reject) => {
    rimraf('./tmp', [], (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      resolve();
    });
  });
}

clone().then(changeConfig).then(pack).then(deleteTmp);
