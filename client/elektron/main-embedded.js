#!/usr/bin/env electron

//require('freeport')(function (err, port) {
  //if (err) throw err;

  //var server = require('http').createServer(function (req, res) {
    //require('send-data/html')(req, res,
      //require('fs').readFileSync('./client/elektron/index.html', 'utf8'));
  //}).listen(port);

  var app = require("app");
  var BrowserWindow = require("browser-window");

  require("crash-reporter").start();

  var mainWindow = null;
  //var indexUrl = "http://localhost:" + port;
  var indexUrl = "file:///" + __dirname + "/index.html";

  app.on("ready", function () {
    console.log("opening", indexUrl);
    mainWindow = new BrowserWindow({});
    mainWindow.openDevTools();
    mainWindow.on("closed", function () { mainWindow = null; });
    mainWindow.loadUrl(indexUrl);
  });

//})

