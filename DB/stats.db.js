
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
        matches_played: 1,
        total_winnings: earnings_from_match,
        registered_users: 0
      }
    },
    {
      upsert: true
    })

  },

  updateAfterRegister: function(){

    this.coll.updateOne({},
      {
        $inc: {
          registered_users: 1,
          total_winnings: 0,
          matches_played: 0
        }
      },
      {
        upsert: true
      }
    )

  },

  getStats: function(){

    return this.coll.findOne({})
    .then((doc)=>{
      console.log(doc);
      return doc;

    })

  }

}

module.exports = stats;
