var ObjectId = require('mongodb').ObjectId;

var p = require("../db.js").promise;

var gamereplays = {};

p.then( function(db){

  gamereplays.coll = db.collection("gamereplays");

})

gamereplays.insertOne = function(game_replay){

  this.coll.insertOne(game_replay);

}

module.exports = gamereplays;
