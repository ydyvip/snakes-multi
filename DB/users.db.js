
var bcrypt = require("bcrypt");

var ObjectId = require('mongodb').ObjectId;

var p = require("../db.js").promise;

p.then( function(db){

  users.coll = db.collection("users");

})

var users = {

  checkCredentials: function(username, password){

    return this.coll.findOne({ username: username})
    .then( (doc)=>{
      if(!doc)
        return null;

      return bcrypt.compare(password, doc.password)
      .then((res)=>{
        if(res){
          return doc; // comparision succed
        }
        else{
          return null;
        }
      })

    })

  },

  findById: function(id){
      return this.coll.findOne({_id: ObjectId(id) });
  },


  usernameTaken: function(username){

    return this.coll.findOne( { username: username} )
    .then( (doc) => {
      if(doc){
        return true;
      }
      else{
        return false;
      }
    });

  },
  emailTaken: function(email){

    return this.coll.findOne( { email: email})
    .then( (doc) => {
      if(doc){
        return true;
      }
      else{
        return false;
      }
    });

  },

  registerUser: function(username, password, email, btc_address){

    return bcrypt.hash(password, 9)
    .then((hash)=>{
      return this.coll.insertOne( {
        username: username,
        password: hash,
        email: email,
        btc_address: btc_address,
        balance_total: 100,
        balance_withdrawal: 0
      } );
    });
  },

  checkBalance: function(playername, charge){

    var reduction_obj = {
      success: false,
      balance_total_reduction: 0,
      balance_withdrawal_reduction: 0
    }

    return this.coll.findOne({
      username: playername
    },
    {
      projection: {
        balance_total: 1,
        balance_withdrawal: 1
      }
    })
    .then((doc)=>{

      if(doc.balance_total>=charge){
        reduction_obj.success = true;
        reduction_obj.balance_total_reduction = charge;

        var balance_after = doc.balance_total - charge;
        // equalize balance when withdrawal exceeded total
        if(balance_after<doc.balance_withdrawal){
          reduction_obj.balance_withdrawal_reduction = doc.balance_withdrawal - balance_after;
        }
      }
      else{
        reduction_obj.success = false;
      }

      return reduction_obj;

    })

  },

  reduceBalances: function(player_names, amount){

    this.coll.updateMany(
      {
        username: {
          $in: player_names
        }
      },
      {
        $inc: {
          balance_total: amount
        }
      }
    );

  },

  incrementBalanceForWinner: function(username, amount){

    this.coll.updateOne(
      {
        username: username
      },
      {
        $inc: {
          balance_withdrawal: amount
        }
      }
    );

  },

  incrementBalanceForAdressOwner: function(btc_address, amount){

    this.coll.updateOne(
      {
        btc_address: btc_address
      },
      {
        $inc: {
          balance_total: parseInt(amount)
        }
      }
    );

  }

}


module.exports = users;
