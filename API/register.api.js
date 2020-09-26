
var router = require("express").Router();
const geoip = require('geo-from-ip')

var Users = require("../DB/users.db.js");
var Stats = require("../DB/stats.db.js");

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
    else if( req.body.username.length>25){
      response.errs.push({
        for: "username",
        msg: "Username length must be at most 25 characters"
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

      var referrer = null;

      if(req.cookies.referrer){
        referrer = req.cookies.referrer;
      }
      else if(req.body.referrer){
        referrer = req.body.referrer;
      }

      //check if referrer exist
      Users.usernameTaken(req.cookies.referrer)
      .then( (referrer_exist)=>{

        if(referrer_exist){
          referrer = req.cookies.referrer;
        }
        else{
          referrer = null;
        }

        console.log(req.connection.ip);

        var country_code = null;
        var ip_data = null;

        try {
          var ip_data = geoip.allData( req.ip );
          country_code = ip_data.code.country;
        }
        catch (e){
          console.log("error");
        }

        Users.registerUser( req.body.username, req.body.password, req.body.email, referrer, country_code )
        .then( ()=> {
          if(referrer_exist){
            Users.refferalGained(referrer, req.body.username);
          }
          Stats.updateAfterRegister();
          res.json(response);
        })

      })

    }
  })
})

// referrer system
// Sample URI /register/ref/user_xxx

router.get("/ref/:ref_username", (req, res)=>{

	Users.usernameTaken(req.params.ref_username)
	.then( (username_exist)=>{

		if(username_exist){
			res.cookie("referrer", req.params.ref_username, {
				expires: new Date( Date.now() + 604800000 )
			} );
		}

		res.redirect("/");

	});

})

module.exports = router;
