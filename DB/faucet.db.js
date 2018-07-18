
var ObjectId = require('mongodb').ObjectId;

var p = require("../db.js").promise;

p.then( function(db){

  faucets.coll = db.collection("faucets");

})

var faucets = {

    getAllForList: function(){

      return this.coll.find(
        {
          approved: true,
          $where: "this.balance >= this.reward"
        }
      ).toArray();

    },

    withdraw: function(api_key){

      // Reduce balance by reward

      return this.coll.findOne(
        {
          api_key: api_key
        },
        {
          reward: 1
        }
      )
      .then((doc)=>{

        return this.coll.updateOne(
          {
            api_key: api_key
          },
          {
            $inc: {
              balance: -doc.reward
            },
            $currentDate: {
              last_visited: true
            }
          }
        )
        .then(()=>{
          return doc.reward;
        });

      });

    }

}

module.exports = faucets;
