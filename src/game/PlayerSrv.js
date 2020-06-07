
var Player = require("./Player.js");
var random = require("random-js")();

Player.prototype.srv = true;

Player.prototype.changeDirSrv = function(newdir, tm, reduction_sync_complete){


  if((newdir != "left" && newdir != "right" && newdir != "straight") || /[^0-9]/.test(tm)){
    return;
  }

  if(this.killed==true)
    return;

  if(reduction_sync_complete){
    this.ignore_input = false;
  }

  if(this.ignore_input)
    return;

  var input = {
    type: "changedir",
    dir: newdir,
    tm: tm
  }


  // Collision test should be performed every 20px (player weight*2)
  //  1000[1s] / (50[px/s]/20px[weight]) --> 400ms
  // So collision test should be performed every 400ms, if lag is bigger there should be additional collision checking performed...
  // For speed 100px/s - every 100ms


  var tm_now = Date.now();
  var lag_tolerance = 1000 / (this.speed/(this.weight*2)) ; //400ms for 50px/s
  var lag = tm_now - tm;

  console.log(this.name + " " + input.dir);
  console.log("LAG: " + lag);

  if(lag<0){
    console.log("--LAG");
    return;
  }

  if(lag>lag_tolerance){

      this.ignore_input = true;
      input.tm_raw = input.tm;

      this.socket.emit("reduction", this.id_cnt);
      this.socket.emit("slow_connection_warrning");

      return; //ignore lagged input


  }


  // reset collision if input was triggered earlier
  if(this.collision_tm != 0 && tm<this.collision_tm){

      console.log("RESETING")
      console.log(" collision_tm: " + this.collision_tm);
      console.log(" type: " + this.collision_type);
      if(this.collision_participant){
        console.log( " participant: " + this.collision_participant.name);
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
