
var ObjectId = require('mongodb').ObjectId;

var p = require("../db.js").promise;

p.then( function(db){

  stats.coll = db.collection("stats");

})

var stats = {

  updateFromMatchPlayed: function(provision, ref_reward, winner_reward ){

    this.coll.updateOne({},
    {
      $inc: {
        matches_played: 1,
		provisions_earn: provision,
		refs_earn: ref_reward,
		winners_earn: winner_reward,
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
          registered_users: 1
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
