
var ObjectId = require('mongodb').ObjectId;

var p = require("../db.js").promise;

p.then( function(db){

  stats.coll = db.collection("stats");

})

var stats = {

  updateFromMatchPlayed: function(earnings_from_match){

    this.coll.updateOne({},
    {
      $inc: {
        games_played: 1,
        earnings: earnings_from_match
      }
    },
    {
      upsert: true // first invocation creates collection and doc
    })

  }

}

module.exports = stats;
