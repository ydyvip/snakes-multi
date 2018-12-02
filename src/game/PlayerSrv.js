
var Player = require("./Player.js");
var random = require("random-js")();

Player.prototype.changeDirSrv = function(newdir, path_id){

  if(this.speed==0)
    return;

  var done_path = this.changeDir(newdir);
  this.savePath(done_path, "serv");
  this.applyChangeDir();

  this.socket.emit("reapplycurpath", this.curpath, this.dir, this.angle);

  if(path_id==-1){
    return done_path;
  }
  else{ // changed from breakdown
    this.io.to(this.socket.currentRoom).emit("dirchanged", this.socket.playername, newdir, done_path, path_id );
  }

}

Player.prototype.timeout_breakdown = undefined;

Player.prototype.setupBreakout = function(){

  var time = random.integer(1000, 2000);

  this.timeout_breakdown = setTimeout( ()=>{

    var done_path = this.changeDirSrv(this.dir, -1);

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

module.exports = Player;
