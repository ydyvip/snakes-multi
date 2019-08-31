
var GameReplayDB = require.main.require("./DB/gamereplays.db.js");

var GameReplayPlayer = function(){
  this.round_inputs = [];
  this.tm_next = 0;
  this.tm_base = 0;  // tm_round_start
  this.player_states = [];
}

GameReplayPlayer.prototype.populateInputsForRound = function(player_states, replay_id, round_ix){

  GameReplayDB.getInputsForRound(replay_id, round_ix)
  .then((inputs)=>{

    this.round_inputs = inputs;
    this.player_states = player_states;
    this.tm_next = 0;
    this.tm_base = 0;

  })
}

GameReplayPlayer.prototype.setTmBase = function(tm_base){

  this.tm_base=tm_base;
  if(this.round_inputs.length == 0)
  {
    this.tm_next = 0;
    return;
  }

  if(this.round_inputs[0].type=="quit_consideration")
  {
    this.tm_next = this.tm_base + 4000;
  }
  else{
    this.tm_next = this.tm_base + this.round_inputs[0].tm;
  }

}

GameReplayPlayer.prototype.shiftInput = function(tm_cur){

  if(tm_cur>this.tm_next && this.tm_base != 0){

    var input = this.round_inputs.shift();

    if(!input){
      this.tm_next = 0;
      return;
    }

    for(var i = 0; i<this.player_states.length; i++){
      if(this.player_states[i].name == input.for){
        console.log("...");
        console.log(input);
        if(input.type == "quit_consideration"){
          this.player_states[i].changeDirSrv("quit_consideration");
        }
        else{
          this.player_states[i].changeDirSrv(input.dir, this.tm_base + input.tm );
        }

        if(this.round_inputs.length == 0){
          this.tm_next = 0;
          return;
        }

        if(this.round_inputs[0].type == "quit_consideration"){
          this.tm_next = this.tm_base + 4000;
        }
        else{
          this.tm_next = this.tm_base + this.round_inputs[0].tm;
        }
        return;
      }
    }

  }


}

module.exports = GameReplayPlayer;
