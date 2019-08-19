
if(process.argv[2] == "TEST_MODE"){
  process.TEST_MODE = true;
  console.log("running in test mode");
}

var express = require("express");
var bodyparser = require("body-parser");
var session = require("express-session");
const MongoStore = require('connect-mongo')(session);
var passport = require("passport");
require("./API/passport_conf.js");

var app = express();

var http = require("http").Server(app);

// Mount io server
var io = require("socket.io")(http);
io.on("connection", function(socket){
    var lobby = require("./lobby.js")(io, socket);
})

var login = require("./API/login.api.js");
var register = require("./API/register.api.js");
var faucet = require("./API/faucet.api.js");

var db = require("./db.js");
db.promise.then( function(){
	http.listen(3006, function(){
		console.log("App listen on 3006 port");
	});
})

app.use(express.static("public"));
app.use(session({
   secret: "TeraXaxzz",
   store: new MongoStore({
     dbPromise: db.promise
   }),
   cookie: {
     maxAge: 1000 * 60 * 60 * 24 * 30 // one month
   },
   resave: false,
   saveUninitialized: false
}));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
app.use(passport.initialize());
app.use(passport.session());


app.use("/login", login);
app.use("/register", register);
app.use("/faucet", faucet);
