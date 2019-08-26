
const gameloop = require('node-gameloop');

var Player = require("./src/game/PlayerSrv.js");
var GameState = require("./src/game/GameState.js");
var GameReplay = require("./src/game/GameReplay.js")
var random = require("random-js")();

var Users = require("./DB/users.db.js")
var Stats = require("./DB/stats.db.js")

var stubber = require("./cypress/stubber.js");

var io = null;

var games = [];
var sample_game = null;

function Game( player_creator, name, bet, max_players){

  this.max_players = max_players;
  this.cnt_players = 1;
  this.players = [];
  this.name = name;
  this.bet = bet;
  this.round_points = 0;

  this.first_to_reach = (max_players-1)*5;

  this.players.push(player_creator);

  this.gameloop_id = null

}

if(process.TEST_MODE == true){
  stubber.stubGamePrototype(Game);
}


Game.prototype.getPlayersName = function(){

  var arr = [];
  for(var p of this.players){
    arr.push( p.playername);
  }
  return arr;
}

Game.prototype.collisionDetected = function(player_state, collision_tm, type, participant){

  if(player_state.name=="user6")
    console.log("collision detected: " + collision_tm);

  player_state.collision_tm = collision_tm;

  player_state.path_at_collision = player_state.getCurpath();

  if(type=="curpath-curpath"){
    player_state.collision_type = type;
    player_state.collision_participant = participant;
  }

  if(player_state.collision_force){
    player_state.collision_timeout = null;
    player_state.clearFurtherPaths(collision_tm, false, true);
    player_state.applyCurpathState(player_state.collision_before_input.path_at_collision);
    player_state.speed = 0;
    player_state.collision_tm = 0;
    player_state.killed = true;
    this.emitKilled(player_state, player_state.collision_before_input.collision_tm, player_state.collision_before_input.path_at_collision, true); //4th arg true due to force
    if(player_state.name=="user6")
      console.log("collision emmitted(forced): " + collision_tm);
    return;
  }

  player_state.collision_timeout = setTimeout( ()=>{

    // collision detected but player can move in last time, we should wait for input beacuse of lag
    // dead reckoning phase may be wrong, we will wait some time for new input

    if(player_state.collision_tm != 0){
      player_state.collision_timeout = null;
      player_state.recomputeCurpath(player_state.collision_tm);
      player_state.speed = 0;
      player_state.collision_tm = 0;
      player_state.killed = true;
      this.emitKilled(player_state, collision_tm, player_state.path_at_collision);
      if(player_state.name=="user6")
        console.log("collision emmitted: " + collision_tm);
    }
    else{
      player_state.collision_timeout = null;
      player_state.speed = player_state.default_speed;
      player_state.collision_tm = 0;
      if(player_state.name=="user6")
        console.log("collision rejected: "+collision_tm);
    }

  }, 250);
}

Game.prototype.emitKilled = function(player_state, collision_tm, path_at_collision, forced){

  var playername = player_state.name;

  // forced
  // done path in history of paths covers path_before_input (strictly curpath head).
  // when input caused reseting, and then collision was detected again, input caused also save of path. path before input is actually equivalent path.

  io.to(this.name).emit("killed", playername, collision_tm, path_at_collision, forced);

  for( var player of this.players){

    if(player.playername == playername && player.live){
      player.points += this.round_points++;
      player.live = false;
      player.socket.player_state.clearBreakout();
    }

  }
  if(this.round_points == this.max_players-1){ // Only one stay alive - end of round condition

    for( var player of this.players){

      if(player.live == true){
        player.points += this.round_points;
        player.live = false;
        player.socket.player_state.clearBreakout();
        player.inputs = [];
        this.round_points = 0;
      }

    }


    // sort players

    this.players.sort( (a,b)=>{
      if(a.points>b.points)
        return -1;
      else if(a.points<b.points)
        return 1
      else {
        return 1;
      }
    });

    var max = 0;
    var game_winner = null;

    if(this.players[0].points>=this.first_to_reach){
      game_winner = this.players[0];
    }


/*
    if(this.players[0].points>=this.first_to_reach){
      max = this.players[0].points;
    }

    for(var i = 1; i<this.players.length; i++){
      if(this.players[i].points+1 >= max){
        this.players[i].tie_break = true;
      }
      else{
        this.players[i].tie_break = false
      }
    }

    if(this.players[1].tie_break == true){
      this.players[0].tie_break = true;
    }
    else {
      this.players[0].tie_break = false;
      game_winner = this.players[0];
    }
*/

    if(game_winner){

      if(this.game_replay)
        this.game_replay.finalizeGameReplay();

      Users.incrementBalanceForWinner(game_winner.playername, Math.floor(this.bet * this.cnt_players * 0.75) )
      Stats.updateFromMatchPlayed( Math.floor(this.bet * this.cnt_players * 0.25) );

      io.to(this.name).emit("end_of_game", game_winner.playername, Math.floor(this.bet*this.max_players*0.75));
      this.detachMyselfFromList();
      this.game_state.end_of_game = true;

    }
    else{
      this.startNewRound();
    }
  }

}

Game.prototype.startNewRound = function(first_round){

  var initial_states = [];

  if(first_round){

    this.player_states = [];

    var colors = ["orange", "cyan", "blue", "red", "pink", "yellow"];
    random.shuffle(colors);

    for( var player_socket of this.players){

      var initial_state = {
        player_name: player_socket.playername,
        color: colors[0]
      }

      initial_states.push(initial_state);

      colors.splice(0, 1);

      var p = new Player(initial_state);
      p.gamename = this.name;
      p.socket = player_socket.socket;
      p.game_state = this.game_state;

      player_socket.socket.player_state = p;

      this.player_states.push(p);

    }

    io.to(this.name).emit("gamestart", initial_states, this.first_to_reach, this.bet);

  } // first round

  var new_round_awaiting = 2;


  io.to(this.name).emit("newround_countdown", new_round_awaiting);

  // (new_round_awaiting+2)*1000 -- 12 sec await
  // round_start emitted after 15 sec (12+3)
  // quit_consideration emmitted after 19 sec (12+3+4)

  setTimeout( ()=> { // 12sec

    var new_round_positions = [];

    this.round_points = 0;

    for( var player of this.players){

      player.live = true;

    }

    for(var player of this.player_states){

      player.speed = 0;
      player.paths = [];
      player.curpath.dir = "straight";
      player.collision_tm = 0;
      player.id_cnt = 0;
      player.id_cnt_srv = 0;
      player.curpath.id = 0;
      player.curpath.after_qc = false;
      if(this.reduction_timeout){
        clearTimeout(this.reduction_timeout);
      }

      var new_pos = this.makeInitPositions(player);

      new_round_positions.push(new_pos);

    }

    io.to(this.name).emit("new_positions_generated", new_round_positions);
    setTimeout(()=>{ // 3sec

      if(!this.game_state)
        return;

      var tm_round_start = Date.now();
      io.to(this.name).emit("round_start", tm_round_start);
      for(var player of this.player_states){
        player.curpath.tm = tm_round_start;
        this.game_state.player_consideration = true;
        player.speed = player.default_speed;
        player.killed = false;
        player.breakout = true;
      }

      this.game_state.tm_quit_consideration = tm_round_start + 4000;

      if(this.game_replay){
        this.game_replay.initNewRound(new_round_positions, tm_round_start, this.game_state.tm_quit_consideration);
      }

      console.log("NEW ROUND STARTED");
      console.log("tm_round_start: " + tm_round_start);
      console.log("tm_quit_consideration: " + parseInt(tm_round_start + 4000));

      setTimeout(()=>{ // 4sec

        for(var player of this.player_states){
          player.inputs.push({
           type: "quit_consideration"
          })
          // player.setupBreakout();
        }

      }, 4000);

    }, 3000);

  }, (new_round_awaiting+2)*1000 );

}


Game.prototype.makeInitPositions = function(player){

  var pos = {
    x: random.integer(100,700),
    y: random.integer(100,700)
  }

  var angle = random.integer(1,360);

  var p_name = null;

  if(player){
    player.curpath.start.x = pos.x;
    player.curpath.start.y = pos.y;
    player.curpath.end.x = pos.x;
    player.curpath.end.y = pos.y;
    player.curpath.angle = angle;
    player.curpath.base_start_angle = angle;
    player.curpath.dir = "straight";
    p_name = player.name;
  }

  return {
    pos: pos,
    angle: angle,
    for: p_name
  }

}

Game.prototype.start = function(){

  Users.reduceBalances( this.getPlayersName(), -this.bet );

  this.game_state = new GameState();
  this.game_replay = new GameReplay(this.getPlayersName());
  this.game_state.game_replay_ref = this.game_replay;

  Player.prototype.io = io;

  // Start first round
  this.startNewRound(true);

  this.gameloop_id = gameloop.setGameLoop( (delta)=>{

    let tm = Date.now();

    this.player_states.forEach( (player_state_item)=>{
      //INPUT QUEUE
      while(player_state_item.inputs.length>0){

        var input = player_state_item.inputs.shift();

        if(input.type == "quit_consideration"){
          player_state_item.quitConsideation(this.game_state.tm_quit_consideration, true);
        }
        else {
          player_state_item.recomputeCurpath( input.tm );
          var state_of_curpath = player_state_item.getCurpath();
          var done_path = player_state_item.changeDir(input.dir, input.tm);
          if(player_state_item.name=="user6"){
            console.log("***");
            console.log(done_path);
            if(done_path.body.vertices){
              console.log(done_path.body.vertices[0])
              console.log(done_path.body.vertices[1])
              console.log(done_path.body.vertices[2])
              console.log(done_path.body.vertices[3])
            }
            if(done_path.body.line){
              console.log(done_path.body.line[0]);
              console.log(done_path.body.line[1]);
            }
            console.log("***")
          }
          if(!input.discard_save){
            player_state_item.savePath(done_path, true);
          }
          if(input.discard_save){
            done_path = null;
          }

          io.to(this.name).emit("dirchanged", player_state_item.socket.playername, input.dir, input.tm, state_of_curpath, done_path  );

        }
        if(this.game_replay){
          this.game_replay.processInput(input, player_state_item.name);
        }
      }

      if(player_state_item.speed>0){
        tm = Date.now();
        player_state_item.recomputeCurpath(tm);
      }

    })

    this.game_state.detectCollision(this.player_states, this, tm );

    for(var player_state_item of this.player_states){
      //collision not detected then we return to normal condition of reseting collisions
     player_state_item.collision_force = false;
    }

    if(this.game_state.end_of_game){
      this.game_state = null;
      this.game_replay = null;
      gameloop.clearGameLoop(this.gameloop_id);
      for(var player of this.players){
        player.socket.currentRoom = null;
        player.socket.leave(this.name);
      }
    }

  }, 1000/66); // update gamestate every 33ms

}

Game.prototype.detachMyselfFromList = function(){

  var idx = games.findIndex((game_item)=>{

    if(game_item.name == this.name){
      return true;
    }

  })

  games.splice(idx,1);

  var arr = games.getGameList();
  io.emit("updategamelist", arr);


}

Game.prototype.delistPlayer = function(playername){

    this.cnt_players--;

    var index = this.players.findIndex((player_item)=>{
      if(player_item.playername == playername){
        return true;
      }
    });
    this.players.splice(index, 1);

    if(this.cnt_players==0){
      this.detachMyselfFromList();
    }


}

games.getRoomWithName = function(gamename){

  var room = this.find( function(game){

    if(game.name == gamename)
      return true;

  });

  return room;

}

games.getGameList = function(){

  var arr = [];

  games.forEach( (game_item)=>{

    var p_names = [];

    game_item.players.forEach( (player_item)=>{
      p_names.push(player_item.playername);
    })

    arr.push({
      cnt_players: game_item.cnt_players,
      max_players: game_item.max_players,
      bet: game_item.bet,
      name: game_item.name,
      players: p_names
    });


  });



  return arr;

}


/*
  socket.currentRoom
*/

module.exports = function( io_, socket ){

  io = io_;

  socket.on("left", function(tm, processed_lag_vector){

    //setTimeout( ()=>{
      socket.player_state.changeDirSrv("left", tm, processed_lag_vector);
    //}, 400)

  })

  socket.on("right", function(tm, processed_lag_vector){

    //setTimeout( ()=>{
      socket.player_state.changeDirSrv("right", tm, processed_lag_vector);
  //  }, 400)

  })

  socket.on("straight", function(tm, processed_lag_vector){

  //  setTimeout( ()=>{
      socket.player_state.changeDirSrv("straight", tm, processed_lag_vector);
  //  }, 400)

  })

  socket.on("getgamelist", function(){

    var arr = games.getGameList();
    socket.emit("updategamelist", arr);

  })

  socket.on("join", function(playername, newroom){

    var previousroom = socket.currentRoom;

    // Check if there is space for new player in room
    var room = games.getRoomWithName(newroom);
    if(!room || room.cnt_players==room.max_players){
      return; // TODO: room is full
    }

    // update previous game
    if(previousroom){
      var previous_game = games.getRoomWithName(previousroom);
      previous_game.delistPlayer(playername);
      socket.leave(previousroom);
    }


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

        socket.join(newroom);
        socket.currentRoom = newroom;
        socket.playername = playername;

        socket.broadcast.emit("roomchanged", playername, previousroom, newroom);

        return true;
      }

    })

    if(new_game.cnt_players==new_game.max_players){

      new_game.start();

    }

  })

  socket.on("newgame", (gamename, bet, max_players, playername, fn)=>{

    if(socket.currentRoom){
      fn({
        for: "confirm",
        err_msg: "Please leave current room before creating another one"
      });
      return;
    }

    if(games.getRoomWithName(gamename)){
      fn({
        for: "gamename",
        err_msg: "Game with given name already exist"
      })
      return;
    }

    if(bet<100){
      fn({
        for: "bet",
        err_msg: "Minimum bet value is 100 Satoshi"
      });
      return;
    }
    if(max_players<2){
      fn({
        for: "max_players",
        err_msg: "Room can be created for at least 2 players"
      });
      return;
    }
    if(max_players>6){
      fn({
        for: "max_players",
        err_msg: "Room can be created for up to 6 players"
      });
      return;
    }

    socket.join(gamename);
    socket.currentRoom = gamename;
    socket.playername = playername;

    var p = {
      playername: playername,
      socket: socket,
      points: 0,
      live: true
    };

    var ng = new Game( p, gamename, bet, max_players);
    games.push(ng);


    var arr = games.getGameList();

    io.emit("updategamelist", arr);

    fn({
      success: true
    });

  })

  socket.on("leave", ()=>{

    if(!socket.currentRoom){
      return;
    }

    var prev_game = games.getRoomWithName(socket.currentRoom);
    prev_game.delistPlayer(socket.playername);

    socket.broadcast.emit("roomchanged", socket.playername, socket.currentRoom, null);

    socket.leave(socket.currentRoom);
    socket.currentRoom = null;

  })

}
