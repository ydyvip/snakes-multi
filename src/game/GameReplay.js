
/* new_round_position
  {
    pos: pos,
    angle: angle,
    for: p_name
  }
*/

/*
  var input = {
    dir: newdir,
    tm: tm
  }
  input.tm_raw
*/



var GameReplayDB = require("../../DB/gamereplays.db.js");

function Round(new_round_positions, tm_round_start, tm_quit_consideration ){

  this.tm_round_start = tm_round_start,
  this.tm_qc = tm_quit_consideration,
  this.new_round_positions = new_round_positions,
  this.inputs = []

}

function GameReplay(player_names, cnt_players, name, bet){

  this.players = player_names;
  this.cnt_players = cnt_players;
  this.name = name;
  this.bet = bet;

  this.cnt_rounds = 0;
  this.rounds = [];
  this.cur_round = null;

}

// Recording methods

GameReplay.prototype.initNewRound = function(new_round_positions, tm_round_start, tm_quit_consideration ){

  this.cnt_rounds++;

  var round = new Round(new_round_positions, tm_round_start, tm_quit_consideration );
  this.rounds.push(round);

  this.cur_round = round;

}

GameReplay.prototype.processInput = function(input, for_){

  input.for = for_;
  if(input.type!="quit_consideration"){
    input.tm = input.tm - this.cur_round.tm_round_start;
    if(input.tm_raw){
      input.tm_raw = input.tm_raw - this.cur_round.tm_round_start;
    }
  }
  this.cur_round.inputs.push(input);

}

GameReplay.prototype.finalizeGameReplay = function(winner, reward){

  GameReplayDB.insertOne({
    players: this.players,
    cnt_rounds: this.cnt_rounds,
    cnt_players: this.cnt_players,
    name: this.name,
    bet: this.bet,
    winner: winner,
    reward: reward,
    rounds: this.rounds
  })

}


module.exports = GameReplay;
