
var Player = require("./Player.js");
var random = require("random-js")();

Player.prototype.srv = true;

Player.prototype.changeDirSrv = function(newdir, tm, reduction_sync_complete){

  if(this.killed==true)
    return;

  if(reduction_sync_complete){
    this.igore_input = false;
  }

  if(this.igore_input)
    return;

  var input = {
    dir: newdir,
    tm: tm
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

    this.igore_input = true;

    tm_to = tm_now-lag_tolerance;

    console.log("Reduction");
    console.log(tm + "  -->  " + tm_to);

    this.socket.emit("reduction", this.id_cnt_srv, tm_to);
    this.socket.emit("slow_connection_warrning");

    input.tm = tm_to; // new time,
    input.tm_raw = input.tm;
    tm = tm_to;

    return; //igore lagged input

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

  this.inputs.push(input);

  return;

}


module.exports = Player;
