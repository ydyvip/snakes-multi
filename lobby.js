
const gameloop = require('node-gameloop');

var Player = require("./src/game/Player.js");
var GameState = require("./src/game/GameState.js");
var random = require("random-js")();

var io = null;

function Game(cnt_players, players, name, bet){

  this.cnt_players = cnt_players;
  this.players = players;
  this.name = name;
  this.bet = bet;

}

Game.prototype.start = function(){

  var player_states = [];
  var initial_states = [];
  var colors = ["orange", "cyan", "blue", "red", "pink", "yellow"];

  console.log("start");

  this.players.forEach((player_item)=>{


    // random initial position, dir and color
    var pos = {
      x: random.integer(100,700),
      y: random.integer(100,700)
    }

    var angle = random.integer(1,360);

    var color = random.pick(colors);
    var index = colors.findIndex( function(color_item){
      if(color_item == color){
        return true;
      }
    })
    colors.splice(index, 1);

    var initial_state = {
      player_name: player_item.playername,
      pos: pos,
      angle: angle,
      color: color
    };

    var p = new Player(initial_state);

    p.curpath.start.x = pos.x;
    p.curpath.start.y = pos.y;
    p.curpath.end.x = pos.x;
    p.curpath.end.y = pos.y;
    p.color = color;
    p.angle = angle

    player_states.push(p);

    player_item.socket.player_state = p;

    initial_states.push(initial_state);

  })

  io.to(this.name).emit("gamestart", initial_states);


  gameloop.setGameLoop( (delta)=>{

    player_states.forEach( (player_state_item)=>{
      player_state_item.go(delta);
    })
    GameState.detectCollision(player_states);

  }, 1000/66); // update gamestate every 33ms


  var curpaths = [];

  // GameState broadcast
  setInterval( ()=> {

    // constant broadcast of game GameState
      // - curpath

    var states_for_emit = [];

     player_states.forEach( (player_state_item)=>{

       states_for_emit.push({
         name: player_state_item.name,
         curpath_end: player_state_item.curpath.end,
         angle: player_state_item.angle,
       })

     })

     io.to(this.name).emit("stateupdate", states_for_emit );

  }, 45 )


}

var game2 = new Game(0,  [], "Empty !!!", 500 );

var games = [];
games.push(game2);

games.getRoomWithName = function(gamename){

  var room = this.find( function(game){

    if(game.name == gamename)
      return true;

  });

  return room;

}

/*
  socket.currentRoom
*/


module.exports = function( io_, socket ){

  io = io_;


  socket.on("left", function(){

    var done_path = socket.player_state.changeDir("left"); // here is error
    socket.player_state.savePath(done_path, true);

    socket.emit("reapplycurpath", socket.player_state.curpath);
    io.to(socket.currentRoom).emit("dirchanged", socket.playername, "left", done_path );

  })

  socket.on("right", function(){

    var done_path = socket.player_state.changeDir("right");
    socket.player_state.savePath(done_path, true);

    socket.emit("reapplycurpath", socket.player_state.curpath);
    io.to(socket.currentRoom).emit("dirchanged", socket.playername, "right", done_path );

  })

  socket.on("straight", function(){

    var done_path = socket.player_state.changeDir("straight");
    socket.player_state.savePath(done_path, true);

    socket.emit("reapplycurpath", socket.player_state.curpath);
    io.to(socket.currentRoom).emit("dirchanged", socket.playername, "straight", done_path );


  })



  socket.on("getgamelist", function(){


    var arr = [];

    games.forEach( (game_item)=>{

      var p_names = [];

      game_item.players.forEach( (player_item)=>{
        p_names.push(player_item.playername);
      })

      arr.push({
        cnt_players: game_item.cnt_players,
        bet: game_item.bet,
        name: game_item.name,
        players: p_names
      });


    });


    socket.emit("updategamelist", arr);

  })

  socket.on("join", function(playername, newroom){

    var previousroom = socket.currentroom;

    // Check if there is space for new player in room
    var room = games.getRoomWithName(newroom);
    if(!room || room.cnt_players==6){
      return; // TODO: room is full
    }

    // update previous game
    games.findIndex( (game)=>{

      if(game.name == socket.currentRoom){
        game.cnt_players--;
        // remove player from list
        var index = game.players.findIndex((player_item)=>{

          if(player_item.playername == playername){
            return true;
          }

        });
        game.players.splice(index, 1);
        socket.leave(previousroom);
        return true;
      }

    })

    // update new game
    var new_game = games.find( (game)=>{

      if(game.name == newroom){
        game.cnt_players++;

        // edit
        game.players.push({
          playername: playername,
          socket: socket
        });

        socket.currentRoom = newroom;
        socket.playername = playername;

        socket.broadcast.emit("roomchanged", playername, previousroom, newroom);

        socket.join(newroom);

        return true;
      }

    })

    if(new_game.cnt_players==6){

      new_game.start();

    }

  })

}
