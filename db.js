
const MongoClient = require('mongodb').MongoClient;
const url = require("./mongouri.json").mongouri;
const dbName = require("./mongouri.json").dbName;

function PromisePending(){
  this.resolve = null;
  this.reject = null;
  this.promise = null;

  this.promise = new Promise((resolve,reject)=>{
    this.resolve = resolve;
    this.reject = reject;
  })

}

const db = {
  promise: null,
  DB: null,
  dbName: dbName,
  clientInstancePromise: new PromisePending()
}

db.promise = MongoClient.connect(url)
.then( function(clientInstance){

  db.DB = clientInstance.db(dbName);
  db.clientInstancePromise.resolve(clientInstance)

  return db.DB;

})

module.exports = db;
