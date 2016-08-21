#! /usr/bin/env node

var path = require('path');
var open = require("open");
var express = require('express');
var exec = require('child_process').exec;

var dir = path.join(__dirname);
var userArgs = process.argv.slice(2);
var target = userArgs[0];
var app = express();

var MAX_BUFFER = 1024 * 1024 * 30;
var PORT = 35606;

if (!target) {
  console.log('usage:\tjdart-vis serve to initiate a server; \n\tjdart-vis <*.jpf> to run upon a target jpf config.');
  return;
}
if (target === 'serve') {
  app.use(express.static(dir));
  app.get('*', function(req, res) { res.sendFile(dir + '/index.html'); });
  app.listen(PORT, function() {
    console.log('Jdart Vis is listening on port', PORT + '.');
  });
} else {
  console.log('Executing jpf...');
  exec('jpf ' + target, { maxBuffer: MAX_BUFFER }, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
    exec('mv tree.json ~/jdart-vis/data/' + target, function(err, stdout, stderr) {
      if (err) {
        console.log(err);
      }
      open("http://localhost:" + PORT + '/' + target);
    });
  });
}
