
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

    }

}

module.exports = faucets;
