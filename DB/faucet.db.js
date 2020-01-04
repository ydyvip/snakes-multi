
var rand = require("random-key");
var bitcore = require("bitcore-lib-cash");


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

    withdraw: function(api_key, to){

      // Reduce balance by reward

      return this.coll.findOne(
        {
          api_key: api_key
        },
        {
          reward: 1,
          last_visited: 1,
          withdraw_history: 1,
          timer: 1, // minutes: * 60 * 1000 to ms
          balance: 1
        }
      )
      .then((doc)=>{

        if(!doc){
          return {
            success: false,
            err_code: 600,
            err_msg: "Invalid api key"
          }
        }

        // check withdraw_history

        for(var i = doc.withdraw_history.length-1; i>=0; i--){

          var withdraw_item = doc.withdraw_history[i];
          if(withdraw_item.to == to){
            var minutes_elapsed = Math.floor((Date.now() - withdraw_item.when)/1000/60);
            var minutes_await = doc.timer - minutes_elapsed;
            if(Date.now() - withdraw_item.when < doc.timer*60*1000)
            {
              return {
                success: false,
                err_code: 601,
                err_msg: "You can withdraw from faucet again in " + minutes_await + " minutes"
              }
            }
          }

        }

        // check faucet balance ...

        if(doc.balance < doc.reward){
          return {
            success: false,
            err_code: 602,
            err_msg: ""
          }
        }

        return this.coll.updateOne(
          {
            api_key: api_key
          },
          {
            $inc: {
              balance: -doc.reward
            },
            $push: {
              withdraw_history: {
                to: to,
                when: Date.now()
              }
            }
          }
        )
        .then(()=>{
          return {
            success: true,
            reward: doc.reward
          }
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

      //var keyPair = bitcoin.ECPair.makeRandom();

      var privateKey = new bitcore.PrivateKey();
      var publicKey = privateKey.toPublicKey();

      var api_key = rand.generate(12, "0123456789abcdefghiklmnopqrstuvwxyz");
      var btc_deposit = keyPair.getAddress();

      var privateKey_wif = privateKey.toWIF();
      var publicKey_address = publicKey.toAddress().toString();

      return this.coll.insertOne({
        name: name,
        url: url,
        reward: reward,
        timer: timer,
        owner: username,
        balance: 0,
        withdraw_history: [],
        api_key: api_key,
        approved: false,
        btc_deposit: privateKey_wif,
        btc_private_key: publicKey_address
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
