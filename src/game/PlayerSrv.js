
var Player = require("./Player.js");
var random = require("random-js")();

Player.prototype.changeDirSrv = function(newdir, tm){

  if(this.killed==true)
    return;

  var input = {
    dir: newdir,
    tm: tm,
    breakout: -1,
  }

  // 250ms lag tolerance
  if(tm<Date.now()-250){
    //lag reduction
    //TODO: path must be reconciled on client side
    tm = Date.now()-250;
  }

  // new input with tm earlier than collision tm

  if(this.name == "user6"){
    console.log("tm_input: " + tm);
  }

  // reset collision if input was triggered earlier
  if(this.collision_tm != 0 && tm<this.collision_tm){
    if(this.name == "user6"){
      console.log("RESETING")
      console.log(" collision_tm: " + this.collision_tm);
      console.log(" type: " + this.collision_type);
      if(this.collision_participant){
        console.log( " participant: " + this.collision_participant.name);
      }
    }
    //handle case when input of user does not prevent collision
    //then collision detected again will be emitted immediately
    this.collision_force = true;
    this.collision_before_input = {
      collision_tm: this.collision_tm,
      path_at_collision: Object.assign({}, this.path_at_collision)
    }
    this.collision_tm = 0; // reset collision

    // in curpath-curpath collision case, input of both players can reject collision (mutual rejecting)
    if(this.collision_type=="curpath-curpath"){
      if(this.collision_participant.collision_tm != 0 && this.collision_participant.collision_type=="curpath-curpath"
         && this.collision_participant.collision_participant == this){

          console.log("RESETING COLLISION OF PARTICIPANT")
          console.log(" collision_tm: " + this.collision_participant.collision_tm);

          this.collision_participant.collision_force = true;
          this.collision_participant.collision_before_input = {
            collision_tm: this.collision_participant.collision_tm,
            path_at_collision: Object.assign({}, this.collision_participant.path_at_collision)
          }
          this.collision_participant.collision_tm = 0; // reset collision
          this.collision_participant.collision_type = null;
          this.collision_participant.collision_participant = null;
          clearTimeout(this.collision_participant.collision_timeout);
      }
    }

    this.collision_type = null;
    this.collision_participant = null;

    //server should emit kill event once so previous timeout must be cleared. otherwise if another collision will be detected two timeouts will be active
    clearTimeout(this.collision_timeout);
  }

  if(this.game_state.player_consideration == false && tm<this.game_state.tm_quit_consideration){

    //apply first path before qc


    this.clearFurtherPaths(this.game_state.tm_quit_consideration, true);
    this.applyStartPoitOfCurpathState(this.path_before_qc);

    if(this.name=="user6"){
      console.log("input triggered before qc arrived after qc");
      console.log("tm of curpath: " + this.curpath.tm);
      console.log("tm of input:" + input.tm);
      console.log("tm of qc: " + this.game_state.tm_quit_consideration );
    }

    input.discard_save = true;

    this.inputs.push(input);
    this.inputs.push({
      type: "quit_consideration"
    })

    return;

  }

  this.inputs.push(input);

  return;

  //TODO: handle breakouts. path_id is legacy
  // if(path_id==-1){ // changed from breakdown
  //   return done_path;
  // }
  //else{
  //  this.io.to(this.socket.currentRoom).emit("dirchanged", this.socket.playername, newdir, done_path, this.renderBuff  );
  //}

}

Player.prototype.timeout_breakdown = undefined;

Player.prototype.setupBreakout = function(){

  var time = random.integer(1000, 2000);

  this.timeout_breakdown = setTimeout( ()=>{

    //TODO: handle breakouts. path_id is legacy (2nd arg)
    var done_path = this.changeDirSrv(this.dir, -1, Date.now());

    this.breakout = true;

    if(done_path){
      this.io.to(this.gamename).emit("breakdown", this.name, done_path, done_path.body.id );
    }

    setTimeout( ()=>{

      this.breakout = false;

      if(this.timeout_breakdown!=undefined)
        this.timeout_breakdown = this.setupBreakout();

    }, 250 );

  }, time );


}

Player.prototype.clearBreakout = function(){


  clearTimeout(this.timeout_breakdown);
  this.timeout_breakdown = undefined;

}

Player.prototype.saveEvent = function(evt){

  this.collisions.push(evt);

}

Player.prototype.clearEvent = function(tm){

  for( let i = 0; i<this.reckoning_events.length; i++){
    if( evt.tm == tm ){
      this.reckoning_events.splice(i, 1);
    }
  }

}

Player.prototype.clearEvents = function(after_tm){

  if(after_tm == undefined){
    this.reckoning_events = [];
  }

  if(this.reckoning_events.length==0)
    return;

  if(this.name=="kubus6"){
    console.log("clearing events before " + after_tm);
  }
  for(let i = this.reckoning_events.length-1; i>=0; i--){

    if(this.reckoning_events[i].tm>=after_tm){
      if(this.name=="kubus6")
        console.log("event deleted");
      this.reckoning_events.splice(i, 1);
    }

  }

}

Player.prototype.isEventValid = function(tm){

  for( evt of this.collisions){
    if( evt.tm == tm )
      return evt;
  }
  return false;
}

module.exports = Player;
