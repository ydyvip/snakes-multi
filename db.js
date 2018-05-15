
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/myproject';

const dbName = 'myproject';


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
