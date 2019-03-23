
var express = require("express");
var io = require("socket.io-client");

var gamename = "Empty";

var app = express();

app.get("/join", function(req, res){

  var socket1 = io("http://localhost:3004/");
  var socket2 = io("http://localhost:3004/");
  var socket3 = io("http://localhost:3004/");
  var socket4 = io("http://localhost:3004/");
  var socket5 = io("http://localhost:3004/");

  socket1.emit("join", "user1", gamename);
  socket2.emit("join", "user2", gamename);
  socket3.emit("join", "user3", gamename);
  socket4.emit("join", "user4", gamename);
  socket5.emit("join", "user5", gamename);

  socket5.on("round_start", (tm_round_start)=>{

    setTimeout(()=>{

      socket5.emit("right", Date.now());

    }, 3950);

    setTimeout(()=>{

      socket5.emit("straight", Date.now());

    }, 5000);

  })

  res.end();

})

app.listen(5000, ()=>{

  console.log("test server running on 5000");

})
