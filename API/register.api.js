
var router = require("express").Router();

var Users = require("../DB/users.db.js");

router.post("/", function(req,res){

  var response = {
    success: null,
    errs: []
  }

  // Password validation
  // https://stackoverflow.com/a/14850765/8060962
  var pass_valid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(req.body.password);
  if(!pass_valid){
    response.errs.push({
      for: "password",
      msg: "Password must be: one digit, one lower case, one upper case, 8 char long"
    })
  }


  if( req.body.btc_address == ""){
    response.errs.push({
      for: "btc_address",
      msg: "BTC Address is required"
    })
  }

  Users.usernameTaken(req.body.username)
  .then( function(alreadyTaken){

    if( req.body.username == ""){
      response.errs.push({
        for: "username",
        msg: "Username is required"
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
