#! /usr/bin/env node

var path = require('path');
var open = require("open");
var express = require('express');
var exec = require('child_process').exec;

var dir = path.join(__dirname);
var userArgs = process.argv.slice(2);
var target = userArgs[0];
var app = express();

if (!target) {
  console.log('Please use "jdart-vis serve to create a server, or use "jdart-vis *.jpf" to run upon a target.');
  return;
}
if (target === 'serve') {
  app.use(express.static(dir));
  app.get('*', function(req, res) { res.sendFile(dir + '/index.html'); });
  app.listen(3000, function() {
    console.log('Jdart Vis is listening on port 3000.');
  });
} else {
  exec('jpf ' + target, function(err, stdout, stderr) {
    exec('mv tree.json ~/jdart-vis/data/' + target, function(err, stdout, stderr) {
      open("http://localhost:3000/" + target);
    });
  });
}

function isPortTaken(port, cb) {
  var net = require('net')
  var tester = net.createServer()
    .once('error', function(err) {
      if (err.code != 'EADDRINUSE') return cb(err)
      cb(null, true)
    })
    .once('listening', function() {
      tester.once('close', function() { cb(null, false) })
        .close()
    })
}
