// Playing methods

var GameReplayPlayer = function(){
  this.round_inputs = [];
  this.tm_next = 0;
  this.tm_base = 0;  // tm_round_start
  this.player_states = [];
}

GameReplayPlayer.prototype.populateInputsForRound = function(player_states, replay_id, round_ix){

  // population performed through PlayerSrv.changeDirSrv

  GameReplayDB.getInputsForRound(replay_id, round_ix)
  .then((inputs)=>{

    this.round_inputs = inputs;
    this.player_states = player_states;
    if(this.round_inputs[0].type=="quit_consideration")
    {
      this.tm_next = this.tm_base + 4000;
    }
    else{
      this.tm_next = this.round_inputs[0].tm;
    }

  })

}

GameReplayPlayer.prototype.setTmBase = function(tm_base){
  this.tm_base=tm_base;
}

GameReplayPlayer.prototype.shiftInput = function(tm_cur){

  if(tm_cur>tm_next){

    var input = this.round_inputs.shift();

    for(var i = 0; i<this.player_states.length; i++){
      if(this.player_states[i].name == input.for){
        if(input.type == "quit_consideration"){
          this.player_states[i].changeDirSrv("quit_consideration");
        }
        else{
          this.player_states[i].changeDirSrv(input.dir, this.tm_base + input.tm );
        }

        if(i+1 == this.player_states.length){
          this.tm_next = 0;
        }
        else if(this.round_inputs[i+1].type == "quit_consideration"){
          this.tm_next = this.tm_base + 4000;
        }
        else{
          this.tm_next = this.round_inputs[i+1].tm;
        }
        return;
      }
    }

  }



}

module.exports = GameReplayPlayer;
