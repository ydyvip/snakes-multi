
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
        balance: 100
      } );
    });
  },

  reduceBalances: function(users, amount){

    this.coll.updateMany(
      {
        username: {
          $in: users
        }
      },
      {
        $inc: {
          balance: amount
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
          balance: amount
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
          balance: parseInt(amount)
        }
      }
    );

  }

}


module.exports = users;
