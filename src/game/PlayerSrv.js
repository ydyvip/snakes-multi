
var Player = require("./Player.js");
var random = require("random-js")();

Player.prototype.changeDirSrv = function(newdir, tm){

  if(this.killed==true)
    return;

  if(tm > this.game_state.tm_quit_consideration){
    this.id_cnt_srv++;
  }

  var input = {
    dir: newdir,
    tm: tm,
    breakout: -1,
  }

  // Collision test should be performed every 10px (player weight)
  //  1000[1s] / (50[px/s]/10px[weight]) --> 200ms
  // So collision test should be performed every 200ms, if lag is bigger there should be additional collision checking performed...
  // For speed 100px/s - every 100ms

  var tm_now = Date.now();
  var lag_tolerance = 1000 / (this.speed/this.weight) ; //200ms for 50px/s
  var lag = tm_now - tm;
  var tm_to;
  if(lag>lag_tolerance){

    // not good idea
    // if(lag>lag_tolerance*2){
    //   tm_to = tm+lag_tolerance;
    // }

    tm_to = tm_now-lag_tolerance;
    
    if(tm_to >= this.game_state.tm_quit_consideration && tm<=this.game_state.tm_quit_consideration ){
      tm_to = this.game_state.tm_quit_consideration;
    }

    console.log("");
    console.log("LAG REDUCTION");
    console.log("input tm(from): " + input.tm );
    console.log("new tm(to): " + tm_to);
    console.log("reduced by: " + parseInt(tm_to-input.tm));
    console.log("");

    // input.tm -- from
    // tm_to

    this.reduction_queue.push({
      input_tm: input.tm,
      tm_to: tm_to,
      id: this.id_cnt_srv // id of next path(shortended)
    });

    if(this.reduction_timeout){
      clearTimeout(this.reduction_timeout);
    }

    this.reduction_timeout = setTimeout(()=>{
      this.reduction_timeout = null;
      this.socket.emit("reduction", this.reduction_queue ); // from  -  to
      this.reduction_queue = [];
    }, 2000);

    input.tm = tm_to; // new time,
    tm = tm_to;

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
    var done_path = this.changeDirSrv(this.curpath.dir, -1, Date.now());

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
