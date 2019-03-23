
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
  if(this.collision_tm != 0 && tm<this.collision_tm){
    //TODO: check for collision in 250ms
    this.collision_tm = 0; // reset collision
    //server should emit kill event once so previous timeout must be cleared. otherwise if another collision will be detected two timeouts will be active
    clearTimeout(this.collision_timeout);
  }

  if(this.game_state.player_consideration == false && tm<this.game_state.tm_quit_consideration){

    //apply first path before qc

    this.curpath.start.x = this.path_before_qc.start_x;
    this.curpath.start.y = this.path_before_qc.start_y;
    this.base_start_angle = this.path_before_qc.base_start_angle;
    this.curpath.tm = this.path_before_qc.tm;
    this.dir = this.path_before_qc.dir;

    this.inputs.push(input);
    this.inputs.push({
      type: "quit_consideration"
    })

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
