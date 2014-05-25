var DB_NAME = "tictactoeDB";
var PORT = 3100;

var express = require('express')
    ,fs = require('fs')
    ,crypto = require('crypto')
    ,tls = require('tls')
    ,http = require('http');
    
//Native mongodb
var mongodb = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var server = new mongodb.Server('127.0.0.1', 27017, {safe:true});
//var server = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect: true, safe:true});
var db = new mongodb.Db(DB_NAME, server);   
var GridStore = require('mongodb').GridStore;
var assert = require('assert');
var Binary = require('mongodb').Binary;

//Easily create an http server using express
var app = express();

app.get('/createGame', function(req, res, next) {

  // Handle the get for this route
  db.open(function (error, client) {
    if(error) throw error;
    var gameCollection = new mongodb.Collection(client, 'game');
        
    var userObject = { "gameState" : [] };

    gameCollection.insert(userObject, {safe:true}, function(err, object) {
      if (err) throw error;
      console.log("closing db");
      db.close();
      res.send(JSON.stringify(object[0]._id));
    });
  });
});

app.get('/removeGame/:userId', function(req, res, next) {
  console.log("Removing.");
  // Handle the get for this route
  db.open(function (error, client) {
    if(error) throw error;

    var gameCollection = new mongodb.Collection(client, 'game');
    gameCollection.remove({_id : new ObjectID(req.params.userId)}, function(error, object) {
      if(error) throw error;
      console.log("closing db");
      db.close();
      res.send("Removed.");
    });
  });
});

app.get('/saveGame/:userId/:player/:gridButton', function(req, res, next) {
  console.log("Saving " + req.params.player + ", " + req.params.gridButton);
  
  var gridObject = {
                    "player" : req.params.player,
                    "gridButton" : req.params.gridButton
                   };
  
  // Handle the get for this route
  db.open(function (error, client) {
    if(error) throw error;
    var gameCollection = new mongodb.Collection(client, 'game');
    
    gameCollection.update({_id : new ObjectID(req.params.userId)}, {$push :{ "gameState" : gridObject}}, function(error, object) {
      if(error) throw error;
      console.log("closing db");
      db.close();
      res.send("Saved.");
    });
  });
});

app.get('/retrieveGame/:userId', function(req, res, next) {
  console.log("retrieveGame.");
  // Handle the get for this route
  db.open(function (error, client) {
    if(error) throw error;

    var gameCollection = new mongodb.Collection(client, 'game');
    
    gameCollection.findOne({_id : new ObjectID(req.params.userId)}, function(error, object) {
      if(error) throw error;
      console.log("closing db");
      db.close();
      res.send(object);
    });
  });
});

app.listen(PORT);
console.log('Server is Listening on port ' + PORT);
