
var router = require("express").Router();

var Users = require("../DB/users.db.js");

router.post("/", function(req,res){

  var response = {
    success: null,
    errs: []
  }

  if( !req.body.password ){
    response.errs.push({
      for: "password",
      msg: "Password is required"
    })
  }
  else if( req.body.password.length<5){
    response.errs.push({
      for: "password",
      msg: "Password length must be at least 5 characters"
    })
  }
  else if( req.body.password.length>=14){
    response.errs.push({
      for: "password",
      msg: "Password length must be at most 14 characters"
    })
  }
  else if( new RegExp("[a-zA-Z]").test(req.body.password) == false ){
    response.errs.push({
      for: "password",
      msg: "Password must contain at least one alphabetic character"
    })
  }
  else if( new RegExp("[0-9]").test(req.body.password) == false ){
    response.errs.push({
      for: "password",
      msg: "Password must contain at least one digit"
    })
  }

  if( !req.body.btc_address ){
    response.errs.push({
      for: "btc_address",
      msg: "BTC Address is required"
    })
  }

  else if( req.body.btc_address.length<26 || req.body.btc_address.length>35 ){
    response.errs.push({
      for: "btc_address",
      msg: "Invalid bitcoin address format"
    })
  }

  Users.usernameTaken(req.body.username)
  .then( function(alreadyTaken){

    if( !req.body.username ){
      response.errs.push({
        for: "username",
        msg: "Username is required"
      })
    }
    else if( req.body.username.length<5){
      response.errs.push({
        for: "username",
        msg: "Username length must be at least 5 characters"
      })
    }
    else if( req.body.username.length>=14){
      response.errs.push({
        for: "username",
        msg: "Username length must be at most 14 characters"
      })
    }

    else if(alreadyTaken){
      response.errs.push({
        for: "username",
        msg: "Username already taken"
      })
    }

    return response;

  })
  .then( function(response){

    // https://stackoverflow.com/a/46181/8060962
    req.body.email = req.body.email.toLowerCase();
    if(!req.body.email){

      response.errs.push({
        for: "email",
        msg: "Invalid email format"
      })
      return response;
    }

    var email_valid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(req.body.email);

    if(!email_valid){

      response.errs.push({
        for: "email",
        msg: "Invalid email format"
      })

      return response;
    }

    return Users.emailTaken(req.body.email)
    .then( function(alreadyTaken){

      if(alreadyTaken){
        response.errs.push({
          for: "email",
          msg: "Email already taken"
        })
      }

      return response;

    })

  })
  .then( function(response){

    if(response.errs.length > 0){
      response.success = false;

      res.json(response);

    }
    else{
      response.success = true;
      Users.registerUser( req.body.username, req.body.password, req.body.email, req.body.btc_address )
      .then( ()=> {
        res.json(response);
      })
    }
  })


})


module.exports = router;
