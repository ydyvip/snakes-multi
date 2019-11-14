
if(process.argv[2] == "TEST_MODE"){
  process.TEST_MODE = true;
  console.log("running in test mode");
}

else if(process.argv[2] != "NO_CYPRESS"){
  // NO_CYPRESS and TEST_MODE args passed so we are on hosting
  // handle problem on hosting with logs
  var fs = require('fs');
  var writeStream = fs.createWriteStream('./test.log', {
    encoding: 'utf8',
    flags: 'w'
  });

  process.stdout = require('stream').Writable();
  process.stderr = require('stream').Writable();

  process.stdout._write = function(chunk, encoding, callback) {
      writeStream.write(chunk, encoding, callback);
  };

  process.stderr._write = function(chunk, encoding, callback) {
      writeStream.write(chunk, encoding, callback);
  };
}

var express = require("express");
var bodyparser = require("body-parser");
var session = require("express-session");
const MongoStore = require('connect-mongo')(session);
var passport = require("passport");
require("./API/passport_conf.js");

var passportSocketIo = require("passport.socketio");

var app = express();

var http = require("http").Server(app);



var login = require("./API/login.api.js");
var register = require("./API/register.api.js");
var faucet = require("./API/faucet.api.js");
var gamereplays = require("./API/gamereplays.api.js");

var db = require("./db.js");
db.promise.then( function(){
	http.listen(3006, function(){
		console.log("App listen on 3006 port");
	});
})

var secret = "u7ga782";
var session_store = new MongoStore(
  {
    dbPromise: db.promise
  }
);

var session_middleware = session({
   secret: secret,
   store: session_store,
   cookie: {
     maxAge: 1000 * 60 * 60 * 24 * 30 // one month
   },
   resave: false,
   saveUninitialized: false
});

app.use(express.static("public"));
app.use(session_middleware);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
app.use(passport.initialize());
app.use(passport.session());

app.use("/login", login);
app.use("/register", register);
app.use("/faucet", faucet);
app.use("/gamereplays", gamereplays);

// Mount io server
var io = require("socket.io")(http);

io.use(passportSocketIo.authorize({
  key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       secret,    // the session_secret to parse the cookie
  store:        session_store,        // we NEED to use a sessionstore. no memorystore please
  success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept){

  //console.log("Authorized socket io connection");
  accept();

}

function onAuthorizeFail(data, message, error, accept){

  //console.log("Non-Authorized socket io connection");
  //console.log(message);

  // error indicates whether the fail is due to an error or just a unauthorized client
  if(error)  throw new Error(message);
  // send the (not-fatal) error-message to the client and deny the connection
  return accept(new Error(message));
}


io.on("connection", function(socket){
    var lobby = require("./lobby.js")(io, socket);
})
