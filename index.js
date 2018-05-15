
var express = require("express");
var bodyparser = require("body-parser");
var session = require("express-session");
var passport = require("passport");
var JsonStrategy = require("passport-json").Strategy;

var login = require("./API/login.api.js");
var register = require("./API/register.api.js");

var users = require("./DB/users.db.js");

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

var app = express();

app.use(express.static("dist"));
app.use(session({ secret: "TeraXaxzz" }));
app.use(bodyparser.json());
app.use(passport.initialize());
app.use(passport.session());

app.use("/login", login);
app.use("/register", register);

var db = require("./db.js");

db.promise.then( function(){

	app.listen(3004, function(){
		console.log("App listen on 3004 port");
	});

})
