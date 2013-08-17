var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

AwesomeThingsProvider = function(host, port) {
  this.db= new Db('quest', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

AwesomeThingsProvider.prototype.getCollection= function(callback) {
  this.db.collection('awesomeThings', function(error, things_collection) {
    if( error ) callback(error);
    else callback(null, things_collection);
  });
};

AwesomeThingsProvider.prototype.findAll = function(callback) {

	this.getCollection(function(error, things_collection) {
      if( error ) callback(error)
      else {
      	console.log('2');
        things_collection.find().toArray(function(error, results) {

          if( error ) callback(error)
          else callback(null, results)
          	console.log('4');
        });
      }
    });
}

exports.AwesomeThingsProvider = AwesomeThingsProvider;