
const MongoClient = require('mongodb').MongoClient;
const url = require("./mongouri.json").mongouri;
const dbName = require("./mongouri.json").dbName;

var db = {
  promise: null,
  DB: null
}

var promise = MongoClient.connect(url)
.then( function(client){

  db.DB = client.db(dbName);

  return db.DB;

})

db.promise = promise;

module.exports = db;
