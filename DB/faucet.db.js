
var rand = require("random-key");
var bitcoin = require("bitcoinjs-lib")


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

    getNamesOfOwned: function(owner){

      return this.coll.find({
        owner: owner
      }, {
        name: 1
      }).toArray()
      .then( (docs)=> {
        var names = [];
        for(doc of docs){
          names.push(doc.name);
        }
        return names;
      })

    },

    getDetails: function(name) {

      return this.coll.findOne({
        name: name
      }, {
        btc_private_key: 0
      })

    },

    withdraw: function(api_key){

      // Reduce balance by reward

      var keyPair = bitcoin.ECPair.makeRandom();

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

    },

    faucetNameTaken: function(name){

      return this.coll.findOne( { name: name} )
      .then( (doc) => {
        if(doc){
          return true;
        }
        else{
          return false;
        }
      });

    },

    register: function(name, url, reward, timer, username){

      var keyPair = bitcoin.ECPair.makeRandom();

      var api_key = rand.generate(12, "0123456789abcdefghiklmnopqrstuvwxyz");
      var btc_deposit = keyPair.getAddress();

      return this.coll.insertOne({
        name: name,
        url: url,
        reward: reward,
        timer: timer,
        owner: username,
        balance: 0,
        api_key: api_key,
        approved: false,
        btc_deposit: btc_deposit,
        btc_private_key: keyPair.toWIF()
      })
      .then(()=>{

        return {
          api_key: api_key,
          btc_deposit: btc_deposit
        }

      });

    }

}

module.exports = faucets;
