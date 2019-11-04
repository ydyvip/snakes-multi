
/*
  Breakdown is simple object: {
    for: player_name
    tm: ...
  }

  Emit breakdown in advance, and handle it at appriopiate timing on
  input queue.

  INPUT

  type: gap_start | gap_end
  tm: xxx
  for: playername

*/


var random = require("random-js")();

const tm_gapdistane = 335;

function GapController(players,server_side, io, game_name = null){

  this.players = players;
  this.gaps = [];

  for(var p_item of this.players){
    this.gaps.push( new Gap(p_item, server_side, this) );
  }

  if(!GapController.io)
    GapController.io = io;

  this.game_name = game_name; // game_name == room name

  // Client-side socket events handlers
  if(server_side==false){

    this.mountClientSideHandlers();

  }

}

GapController.prototype.mountClientSideHandlers = function(){

  GapController.io.on("gap_renewed", (breakdown)=>{

    for( var player_item of this.players){
      if(player_item.name == breakdown.for){
        console.log("gap_renewed");
        player_item.gap_ref.renewGap(breakdown.tm);
      }
    }
  })

}

GapController.prototype.demountClientSideHandlers = function(){

  GapController.io.off("gap_renewed");

}

GapController.prototype.renewGaps = function(){

  for(var gap of this.gaps){
    gap.renewGap();
  }

}

GapController.prototype.emitBreakdown = function(for_, tm){

  var breakdown_item = {
    for: for_,
    tm: tm
  }

  GapController.io.to(this.game_name).emit("gap_renewed", breakdown_item);

}

function Gap(player_ref, server_side, controller) {

  this.player_ref = player_ref;
  this.player_ref.gap_ref = this;
  this.tmout_gapstart = null;
  this.tmout_gapend = null;

  this.controller = controller;
  this.server_side = server_side;

  this.tm_gapstart = null;
  this.tm_gapend = null;

  this.promise_sync = Promise.resolve(true); // First invocation of setupTimeouts not require sync
  this.resolve_promise = null;

}

Gap.prototype.renewGap = function(tm_gapstart){

  if(this.server_side)
    tm_gapstart = Date.now() + random.integer(1500, 3000);


  this.promise_sync.then( ()=>{

    this.promise_sync = new Promise((resolve,reject)=>{

      this.resolve_promise = resolve;

    })

    this.setupTimeouts(tm_gapstart);

  } );

  if(this.server_side)
    this.controller.emitBreakdown(this.player_ref.name, tm_gapstart);

}

Gap.prototype.setupTimeouts = function(tm_gapstart){



  this.tm_gapstart = tm_gapstart;
  this.tm_gapend = tm_gapstart + tm_gapdistane;

  var tmwait_gap_start = this.tm_gapstart - Date.now()
  var tmwait_gap_end = this.tm_gapend - Date.now()

  // console.log("setupTimeouts");
  // console.log("FOR: " + this.player_ref.name);
  // console.log("tm_gapstart: " + this.tm_gapstart)
  // console.log("tm_gapend: " + this.tm_gapend)
  // console.log("tmwait_gap_start: " + tmwait_gap_start)
  // console.log("tmwait_gap_end: " + tmwait_gap_end)

  if(this.tmout_gapstart){
    console.log("err1")
  }
  this.tmout_gapstart = setTimeout( ()=>{

    this.player_ref.inputs.push({
      type: "gap_start",
      tm: this.tm_gapstart
    })

    this.tmout_gapstart = null;

  }, tmwait_gap_start );

  if(this.tmout_gapend){
    console.log("err2")
  }
  this.tmout_gapend = setTimeout( ()=>{

    this.player_ref.inputs.push({
      type: "gap_end",
      tm: this.tm_gapend
    })

    this.tmout_gapend = null;

  }, tmwait_gap_end)

  // console.log("id timeout start: ")
  // console.log(this.tmout_gapstart);
  // console.log("id timeout end: ");
  // console.log(this.tmout_gapend);

}

Gap.prototype.clearTimeouts = function(){

  if(this.tmout_gapstart){
    clearTimeout(this.tmout_gapstart);
    this.tmout_gapstart = null;
  }
  if(this.tmout_gapend){
    clearTimeout(this.tmout_gapend);
    this.tmout_gapend = null;
  }

  this.promise_sync = Promise.resolve(true);

}

Gap.prototype.startGap = function(){

  this.player_ref.recomputeCurpath(this.tm_gapstart);

  var path = this.player_ref.changeDir(this.player_ref.curpath.dir, this.tm_gapstart, "gap_start");
  this.player_ref.savePath(path);

  this.player_ref.breakout = true;

}

Gap.prototype.endGap = function(){

  this.player_ref.recomputeCurpath(this.tm_gapend);

  var path = this.player_ref.changeDir(this.player_ref.curpath.dir, this.tm_gapend, "gap_end");

  this.player_ref.breakout = false;

  if(this.server_side){
    this.renewGap();
  }

  this.resolve_promise();


}


module.exports = GapController;
