
var Player = require("./Player.js");
var random = require("random-js")();

Player.prototype.changeDirSrv = function(newdir, tm){

  if(this.speed==0)
    return;

  this.inputs.push({
    dir: newdir,
    tm: tm,
    breakout: -1
  });

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

  this.reckoning_events.push(evt);

}

Player.prototype.clearEvent = function(tm){

  for( let i = 0; i++; i<this.reckoning_events.length){
    if( evt.tm == tm ){
      this.reckoning_events.splice(i, 1);
    }
  }

}

Player.prototype.isEventValid = function(tm){

  for( evt of this.reckoning_events){
    if( evt.tm == tm )
      return evt;
  }
  return false;
}

module.exports = Player;
