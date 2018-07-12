
var passport = require("passport");
var JsonStrategy = require("passport-json").Strategy;
var users = require("../DB/users.db.js");


passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {

  users.findById(id)
  .then((user)=>{
    done(null, user);
  });

});


// Strategies require what is known as a verify callback.
// The purpose of a verify callback is to find the user that possesses a set of credentials

passport.use( new JsonStrategy(
	function(username, password, done) {

    users.checkCredentials(username, password)
    .then((user)=>{
      if(!user){
        done(null, false);
      }
      else{
        done(null, user);
      }
    })

	}
))
