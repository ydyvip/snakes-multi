
const gameloop = require('node-gameloop');

var Player = require("./src/game/Player.js");
var GameState = require("./src/game/GameState.js");
var random = require("random-js")();

var io = null;

function Game(cnt_players, players, name, bet){

  this.max_players = 6;
  this.cnt_players = cnt_players;
  this.players = players;
  this.name = name;
  this.bet = bet;
  this.round_points = 0;

  this.gameloop_id = null
  this.serveloop_id = null;

}

Game.prototype.emitKilled = function(playername){

  io.to(this.name).emit("killed", playername);

  for( var player of this.players){

    if(player.playername == playername && player.live){
      player.points += this.round_points++;
      player.live = false;
    }

  }

  if(this.round_points == this.max_players-1){

    // apply 5 points to winner

    for( var player of this.players){

      if(player.live == true){
        player.points += this.round_points;
        player.live = false;
        this.round_points = 0;
      }

    }


    this.startNewRound();
  }

}

Game.prototype.startNewRound = function(){

  var new_round_awaiting = 10;


  io.to(this.name).emit("newround_countdown", new_round_awaiting);


  setTimeout( ()=> {

    var new_round_positions = [];

    this.round_points = 0;

    for( var player of this.players){

      player.live = true;

    }

    for(var player of this.player_states){

      player.speed = 0;
      player.paths = [];
      player.path_cnt = 0;
      player.dir = "straight";

      var new_pos =  this.makeInitPositions(player);
      new_pos.for = player.name;

      new_round_positions.push(new_pos);

    }

    io.to(this.name).emit("new_positions_generated", new_round_positions);

    setTimeout(()=>{
      io.to(this.name).emit("round_start");
      for(var player of this.player_states){
        player.speed = player.default_speed;
      }
    }, 3000);



  }, (new_round_awaiting+2)*1000 );




}

var i = 1;

Game.prototype.makeInitPositions = function(player){

  var pos = {
    x: random.integer(100,700),
    y: random.integer(100,700)
  }

  pos.x = 50*i;
  pos.y = 400;

  if(i == 6){
    pos.y = 300;
  }

  i++;
  if(i>6)
    i = 1;

  var angle = random.integer(1,360);

  angle = 270;

  if(player){
    player.curpath.start.x = pos.x;
    player.curpath.start.y = pos.y;
    player.curpath.end.x = pos.x;
    player.curpath.end.y = pos.y;
    player.angle = angle;
    player.dir = "straight";
  }

  return {
    pos: pos,
    angle: angle
  }

}

Game.prototype.start = function(){

  this.player_states = [];
  var initial_states = [];
  var colors = ["orange", "cyan", "blue", "red", "pink", "yellow"];

  this.players.forEach((player_item)=>{

    var color = random.pick(colors);
    var index = colors.findIndex( function(color_item){
      if(color_item == color){
        return true;
      }
    })
    colors.splice(index, 1);

    var angle_pos = this.makeInitPositions(); // angle & pos: returned and setted

    var initial_state = {
      player_name: player_item.playername,
      color: color,
      angle: angle_pos.angle,
      pos: angle_pos.pos
    };

    var p = new Player(initial_state);

    p.curpath.start.x = angle_pos.pos.x;
    p.curpath.start.y = angle_pos.pos.y;
    p.curpath.end.x = angle_pos.pos.x;
    p.curpath.end.y = angle_pos.pos.y;
    p.color = color;
    p.angle = angle_pos.angle

    this.player_states.push(p);

    player_item.socket.player_state = p;

    initial_states.push(initial_state);

  })

  io.to(this.name).emit("gamestart", initial_states);


  this.gameloop_id = gameloop.setGameLoop( (delta)=>{

    this.player_states.forEach( (player_state_item)=>{
      player_state_item.go(delta);
    })
    GameState.detectCollision(this.player_states, this);

  }, 1000/66); // update gamestate every 33ms



  var curpaths = [];

  // GameState broadcast
  this.serveloop_id = setInterval( ()=> {

    // constant broadcast of game GameState
      // - curpath

    var states_for_emit = [];

     this.player_states.forEach( (player_state_item)=>{

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

    if(socket.player_state.speed==0)
      return;

    var done_path = socket.player_state.changeDir("left"); // here is error
    socket.player_state.savePath(done_path, true);

    socket.emit("reapplycurpath", socket.player_state.curpath, socket.player_state.dir, socket.player_state.angle);
    io.to(socket.currentRoom).emit("dirchanged", socket.playername, "left", done_path );

  })

  socket.on("right", function(){

    if(socket.player_state.speed==0)
      return;

    var done_path = socket.player_state.changeDir("right");
    socket.player_state.savePath(done_path, true);

    socket.emit("reapplycurpath", socket.player_state.curpath, socket.player_state.dir, socket.player_state.angle);
    io.to(socket.currentRoom).emit("dirchanged", socket.playername, "right", done_path );

  })

  socket.on("straight", function(){

    if(socket.player_state.speed==0)
      return;

    var done_path = socket.player_state.changeDir("straight");
    socket.player_state.savePath(done_path, true);

    socket.emit("reapplycurpath", socket.player_state.curpath, socket.player_state.dir, socket.player_state.angle);
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
          socket: socket,
          points: 0,
          live: true
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
