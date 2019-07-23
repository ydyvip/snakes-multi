

var circleArcCollision = require("./circle-arc-collision.js");
var Arc = require("./arc.js");

function getRad(degree){
  degree = degree % 360;
  if(degree<0){
    degree = 360 + degree;
  }
  var radians = degree * (Math.PI / 180);
  return radians;
}


var Player = function(initial_state){

  this.name = initial_state.player_name;
  this.speed = 0;
  this.default_speed = 50;
  this.weight = 10;
  this.r = 30;
  this.paths = [];
  this.breakout = true; // breakout should be used only for rendering purpose, not for determining if path should be saved or not
  this.show_dir_indicator = true;
  this.killed = true;
  this.collision_tm = 0;
  this.collision_timeout = null;
  this.collision_force = false;
  this.collision_before_input = {};
  this.collision_type = null;
  this.collision_participant = null;
  this.id_cnt = 0;
  this.curpath = {
    id: 0,
    dir: "straight",
    tm: 0,
    angle: undefined,
    base_start_angle: undefined,
    start: {
      x: undefined,
      y: undefined
    },
    end: {
      x: undefined,
      y: undefined
    },
    arc_point: {
      x: 0,
      y: 0
    }

  };

  this.color = initial_state.color;

  this.reckoning_events = [];
  this.collisions = [];
  this.inputs = [];
  this.events = [];

}

Player.prototype.draw = function(self){

  this.ctx.strokeStyle = this.color;
  this.ctx.fillStyle = this.color;


  if(this.restart){
    this.speed = 0;
    this.paths = [];
    this.curpath.dir = null;
    this.restart = false;
  }

  if(!this.dir_indicator && self){
    this.dir_indicator = new Image();
    this.dir_indicator.src = "/img/dir_indicators/" + this.color + ".svg";
    this.dir_indicator.onload = ()=>{
      this.dir_indicator_ready = true
    }
  }

  if(this.dir_indicator_ready && this.show_dir_indicator && self){
    this.ctx.save();
    this.ctx.translate(this.curpath.end.x, this.curpath.end.y  )
    this.ctx.rotate((this.curpath.angle + 90) * Math.PI / 180);
    this.ctx.drawImage(this.dir_indicator, -146/2, -70 , 146, 60);
    this.ctx.restore();
  }

  // drawing done paths
  this.ctx.lineCap = "butt";

  for(var i = 0; i<this.paths.length; i++){

    this.ctx.strokeStyle = this.paths[i].body.color;
    this.ctx.lineWidth = this.paths[i].body.weight;
    this.ctx.stroke(this.paths[i]);

  }

  // drawing current path
  this.ctx.lineCap = "butt";

  this.ctx.lineWidth = this.weight;

  //drawing head of curpath
  this.ctx.beginPath();
  this.ctx.arc(this.curpath.end.x, this.curpath.end.y, this.weight/2, 0, 2*Math.PI);
  this.ctx.fill();

  if(this.curpath.dir == "straight" && !this.breakout){
    this.ctx.beginPath();
    this.ctx.moveTo(this.curpath.start.x, this.curpath.start.y);
    this.ctx.lineTo(this.curpath.end.x, this.curpath.end.y);
    this.ctx.stroke();
  }

  var starting_angle;

  if(this.curpath.dir == "left" && !this.breakout){

    if(this.breakout)
      starting_angle = this.curpath.angle + 90;
    else
      starting_angle = this.curpath.starting_angle;

    this.ctx.beginPath();
    this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(starting_angle), getRad( this.curpath.angle + 90), true);
    this.ctx.stroke();
  }

  if(this.curpath.dir == "right" && !this.breakout){

    if(this.breakout)
      starting_angle = this.curpath.angle - 90;
    else
      starting_angle = this.curpath.starting_angle;

    this.ctx.beginPath();
    this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(starting_angle), getRad( this.curpath.angle - 90));
    this.ctx.stroke();
  }

}

Player.prototype.createPath2 = function(path_state){

  // path_state is path with body


  var path = new Path2D();

  if(path_state.body.type == "line"){
    path.moveTo(path_state.body.line[0][0], path_state.body.line[0][1]);
    path.lineTo(path_state.body.line[1][0], path_state.body.line[1][1]);
  }

  if( path_state.body.type == "arc" ){
    path.arc( path_state.body.arc.x, path_state.body.arc.y, path_state.body.arc.r, path_state.body.arc.start, path_state.body.arc.end, path_state.body.arc.counterclockwise);
  }

  return path;

}

// used for reduction
Player.prototype.overwritePath = function(path_state_new, index){

  console.log("____________________");
  console.log("overwritePath");

  var path = this.createPath2(path_state_new);
  path.body = path_state_new.body;

  console.log(this.paths[index].body);
  console.log(path_state_new.body);

  this.paths[index] = path;

  console.log("overwritePath");
  console.log("____________________");

}

Player.prototype.savePath = function(path_state, server_side, reconciled_path) {

  // path_state is path with body

  if(!path_state || !path_state.body)
    return;

  var path = {}; // Path2D

  if(!server_side){

    path = this.createPath2(path_state);

  }

  path.body = path_state.body;

  // Path is reconciled for self
  if(reconciled_path){

    var saved = false;

    for(var i = this.paths.length-1; i>=0; i--){
      if(this.paths[i].body.tm == path_state.body.tm){
        console.log("path reconciled");
        saved = true;
        this.paths[i] = path;
      }
    }
    // if(!saved){
    //   console.log("path not reconciled");
    //   this.paths.push(path);
    // }

  }
  else {
    this.paths.push(path);
  }

}

Player.prototype.getVerticesFromLinePath = function(curpath){

  if(!curpath){
    curpath = this.curpath;
  }

  var vertices = [];

  var left_side_sin = Math.sin( getRad(curpath.angle-90) ) * this.weight * 0.5;
  var left_side_cos = Math.cos( getRad(curpath.angle-90) ) * this.weight * 0.5;
  var right_side_sin = Math.sin( getRad(curpath.angle+90) ) * this.weight * 0.5;
  var right_side_cos = Math.cos( getRad(curpath.angle+90) ) * this.weight * 0.5;

  vertices.push( [
    curpath.start.x + left_side_cos,
    curpath.start.y + left_side_sin
  ] );

  vertices.push( [
    curpath.end.x + left_side_cos,
    curpath.end.y + left_side_sin
  ]);

  vertices.push( [
    curpath.end.x + right_side_cos,
    curpath.end.y + right_side_sin
  ]);

  vertices.push( [
    curpath.start.x + right_side_cos,
    curpath.start.y + right_side_sin
  ]);

  return vertices;

}

Player.prototype.getPathBodyFromCurpath = function(curpath){

  var path = {};

  path.body = {};
  path.body.tm = curpath.tm;
  path.body.id = curpath.id;
  path.body.weight = this.weight;
  path.body.color = this.color;
  path.body.angle = curpath.angle;
  path.body.base_start_angle = curpath.base_start_angle;

  if(curpath.dir == "straight"){
    path.body.dir = "straight";
    path.body.type = "line";
    path.body.vertices = this.getVerticesFromLinePath(curpath);
    path.body.line = [ [curpath.start.x, curpath.start.y], [curpath.end.x, curpath.end.y] ];
  }

  if(curpath.dir == "left" || curpath.dir == "right"){

    var angle_90 = 0;
    var counterclockwise = false;

    path.body.type = "arc";

    if(curpath.dir == "left"){
      path.body.dir = "left";
      counterclockwise = true;
      angle_90 = 90;
    }
    if(curpath.dir =="right"){
      path.body.dir = "right";
      angle_90 = -90;
    }

    var arc = new Arc(curpath.arc_point.x, curpath.arc_point.y, this.r, getRad(curpath.starting_angle), getRad(curpath.angle + angle_90), this.weight, counterclockwise  );
    path.body.arc = arc;

  }

  return path;

}

Player.prototype.setInitPositionForCurpath = function(new_dir, tm, prev_curpath, id){

  if(!prev_curpath){
    prev_curpath = this.curpath;
  }

  //cause setInitPositionForCurpath can operate on working_curpath we need proper id
  if(id){
    prev_curpath.id = id;
  }

  if(new_dir == "straight"){

    prev_curpath.start.x = prev_curpath.end.x;
    prev_curpath.start.y = prev_curpath.end.y;

    prev_curpath.base_start_angle = prev_curpath.angle;

    prev_curpath.dir = "straight";

  }

  if(new_dir == "left"){

    prev_curpath.start.x = prev_curpath.end.x;
    prev_curpath.start.y = prev_curpath.end.y;

    prev_curpath.arc_point.x= prev_curpath.end.x + Math.cos(getRad(prev_curpath.angle-90)) * this.r;
    prev_curpath.arc_point.y  = prev_curpath.end.y + Math.sin(getRad(prev_curpath.angle-90)) * this.r;
    prev_curpath.starting_angle = prev_curpath.angle + 90;

    prev_curpath.base_start_angle = prev_curpath.angle;

    prev_curpath.dir = "left";

  }

  if(new_dir == "right"){

    prev_curpath.start.x = prev_curpath.end.x;
    prev_curpath.start.x = prev_curpath.end.y;

    prev_curpath.arc_point.x = prev_curpath.end.x + Math.cos(getRad(prev_curpath.angle+90)) * this.r;
    prev_curpath.arc_point.y = prev_curpath.end.y + Math.sin(getRad(prev_curpath.angle+90)) * this.r;
    prev_curpath.starting_angle = prev_curpath.angle -90;

    prev_curpath.base_start_angle = prev_curpath.angle;

    prev_curpath.dir = "right";

  }

  prev_curpath.tm = tm;

}

Player.prototype.changeDir = function(new_dir, tm){

  var path = {};

  this.id_cnt++;

  if( tm>=this.game_state.tm_quit_consideration )
  {
    path = this.getPathBodyFromCurpath(this.curpath);
  }

  this.setInitPositionForCurpath(new_dir, tm );
  this.curpath.id = this.id_cnt;

  if(path.body){
    return path;
  }
  else{
    return null;
  }

}

Player.prototype.go = function(delta, curpath ) {



  if(curpath.dir == "straight"){
    this.goStraight(delta, curpath);
  }
  if(curpath.dir == "right"){
    this.goRight(delta, curpath);
  }
  if(curpath.dir == "left"){
    this.goLeft(delta, curpath);
  }

  // if(this.breakout){
  //   this.curpath.start.x = this.curpath.end.x;
  //   this.curpath.start.y = this.curpath.end.y;
  // }

}


Player.prototype.goStraight = function(delta, curpath){

  curpath.end.x += Math.cos(getRad(curpath.angle)) * this.speed * delta;
  curpath.end.y += Math.sin(getRad(curpath.angle)) * this.speed * delta;

},

Player.prototype.goLeft = function(delta, curpath){

  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed * delta;

  curpath.angle-=degree_speed;
  if(this.breakout){
    this.curpath.starting_angle = this.curpath.angle + 90;
  }

  curpath.end.x = curpath.arc_point.x + Math.cos( getRad(curpath.angle+90) ) * this.r;
  curpath.end.y = curpath.arc_point.y + Math.sin( getRad(curpath.angle+90) ) * this.r;

},

Player.prototype.goRight = function(delta, curpath){

  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed * delta;

  curpath.angle+=degree_speed;
  if(this.breakout){
    this.curpath.starting_angle = this.curpath.angle - 90;
  }

  curpath.end.x = curpath.arc_point.x + Math.cos( getRad(curpath.angle-90) ) * this.r;
  curpath.end.y = curpath.arc_point.y + Math.sin( getRad(curpath.angle-90) ) * this.r;

}

Player.prototype.setupPos = function(pos){

  this.curpath.start.x = pos.pos.x;
  this.curpath.start.y = pos.pos.y;
  this.curpath.end.x = pos.pos.x;
  this.curpath.end.y = pos.pos.y;
  this.curpath.angle = pos.angle;
  this.curpath.base_start_angle = pos.angle;
  this.curpath.dir = "straight";
}

Player.prototype.recomputeCurpath = function(tm_to_timestep, curpath){

    /*
      when there is no curpath suppiled, we use player's actual curpath
    */
    if(!curpath){
      curpath = this.curpath;
    }

    /*
     set end to start before recomputing
    */
    curpath.angle = curpath.base_start_angle;

    if(curpath.dir == "left")
      curpath.starting_angle = curpath.angle + 90;
    if(curpath.dir == "right")
      curpath.starting_angle = curpath.angle - 90;

    curpath.end.x = curpath.start.x;
    curpath.end.y = curpath.start.y;


    // Go by time since curpath was started (on last changeDir) to time when client changed dir
    /*
      curpath start time: this.curpath.tm
      new dir time: tm_to_timestep (past time because of lag)
    */

    this.go((tm_to_timestep - curpath.tm)/1000,  curpath);

}

Player.prototype.getCurpathFromPathBody = function(path){

  var path_body = path.body;

  var new_curpath = {
    dir: path_body.dir,
    tm: path_body.tm,
    id: path_body.id,
    angle: path_body.angle,
    base_start_angle: path_body.base_start_angle,
    start: {
      x: undefined,
      y: undefined
    },
    end: {
      x: undefined,
      y: undefined
    },
    arc_point: {
      x: 0,
      y: 0
    }

  };

  // set starting angle to its base value
  if(new_curpath.dir == "left")
    new_curpath.starting_angle = new_curpath.angle + 90;
  if(new_curpath.dir == "right")
    new_curpath.starting_angle = new_curpath.angle - 90;


  if(path_body.type == "line"){
    new_curpath.start.x = path_body.line[0][0];
    new_curpath.start.y = path_body.line[0][1];
    new_curpath.end.x = path_body.line[1][0];
    new_curpath.end.y = path_body.line[1][1];
  }

  if(path_body.type == "arc"){
    new_curpath.arc_point.x = path_body.arc.x;
    new_curpath.arc_point.y = path_body.arc.y;
  }

  return new_curpath;

}

Player.prototype.getCurpath = function(){

  var obj = {};

  obj.start_x = this.curpath.start.x;
  obj.start_y = this.curpath.start.y;
  obj.end_x = this.curpath.end.x;
  obj.end_y = this.curpath.end.y;
  obj.angle = this.curpath.angle;
  obj.starting_angle = this.curpath.starting_angle;
  obj.arc_point_x = this.curpath.arc_point.x;
  obj.arc_point_y = this.curpath.arc_point.y;
  obj.dir = this.curpath.dir;
  obj.tm = this.curpath.tm;
  obj.id = this.curpath.id;
  return obj;


}

Player.prototype.applyCurpathState = function(state_of_curpath){

  this.curpath.start.x = state_of_curpath.start_x ;
  this.curpath.start.y = state_of_curpath.start_y  ;
  this.curpath.end.x = state_of_curpath.end_x ;
  this.curpath.end.y = state_of_curpath.end_y  ;
  this.curpath.angle = state_of_curpath.angle  ;
  this.curpath.starting_angle = state_of_curpath.starting_angle  ;
  this.curpath.arc_point.x = state_of_curpath.arc_point_x  ;
  this.curpath.arc_point.y = state_of_curpath.arc_point_y  ;
  this.curpath.dir = state_of_curpath.dir;
  this.curpath.tm = state_of_curpath.tm;
  this.curpath.id = state_of_curpath.id;

}

Player.prototype.applyStartPoitOfCurpathState = function(state_of_curpath){

  this.curpath.start.x = state_of_curpath.start_x ;
  this.curpath.start.y = state_of_curpath.start_y  ;
  this.curpath.end.x = state_of_curpath.start_x ;
  this.curpath.end.y = state_of_curpath.start_y  ;
  this.curpath.angle = state_of_curpath.starting_angle  ;
  this.curpath.starting_angle = state_of_curpath.starting_angle  ;
  this.curpath.arc_point.x = state_of_curpath.arc_point_x  ;
  this.curpath.arc_point.y = state_of_curpath.arc_point_y  ;
  this.curpath.dir = state_of_curpath.dir;
  this.curpath.tm = state_of_curpath.tm;
  this.curpath.id = state_of_curpath.id;

}

Player.prototype.getPos = function(){

  var pos = {};

  pos.x = this.curpath.end.x;
  pos.y = this.curpath.end.y;
  pos.angle = this.curpath.angle;

  return pos;

}

Player.prototype.quitConsideation = function(tm){

  // Save curpath for case when new input that occured before quit consideration arrive.

  this.recomputeCurpath(tm);

  this.path_before_qc = this.getCurpath();

  this.changeDir(this.curpath.dir, tm);

  this.breakout = false;

  this.game_state.player_consideration = false;

}

Player.prototype.clearFurtherPaths = function(tm, include, pop_last){

  if(this.paths.length == 0)
    return;

  if(!include){
    for(var i = this.paths.length-1; i>=0; i--){
      if(this.paths[i].body.tm > tm )
      {
        this.paths.splice(i,1);
      }
    }
  }
  else{
    for(var i = this.paths.length-1; i>=0; i--){
      if(this.paths[i].body.tm >= tm )
      {
        this.paths.splice(i,1);
      }
    }
  }

  if(pop_last){
    this.paths.pop();
  }

}

Player.prototype.reduction = function(from, to, id,  player_me){

  /* bad idea
  var tm_elapsed = Date.now() - this.reduction.last_call;
  if( tm_elapsed < 250){

    this.reduction.last_call = Date.now() + (250 - tm_elapsed);

    setTimeout(()=>{
      this.reduction(from, to, id, player_me);
    }, this.reduction.last_call - Date.now() );

    return;

  }
  else{
    this.reduction.last_call = Date.now();
  }
  */

  console.log("________________________________");
  console.log("LAG REDUCTION");


  var lag_vector = to - from;

  var path_extended = null;
  var index_of_extended = -1;

  // if(from < this.game_state.tm_quit_consideration ){
  //
  // }


  // search paths, case when path_shortened is curpath
  if(player_me.curpath.id == id){
    path_extended = player_me.paths[player_me.paths.length-1];
    index_of_extended = player_me.paths.length-1;
  }

  //search paths, case when path_shortened is in paths history
  else{
    for(var i = player_me.paths.length-1; i>=0; i--){
      var path = player_me.paths[i];
      if(path.body.id == id){
        path_extended = player_me.paths[i-1];
        index_of_extended = i-1;
        break;
      }
    }
  }

  if(path_extended == null){
    console.log("pe");
    console.log(id);
    console.log(player_me.paths);
  }

  // Extension and swap of path designed to extension
  var curpath_for_extended = player_me.getCurpathFromPathBody(path_extended);

  player_me.recomputeCurpath(to, curpath_for_extended );
  var new_extended = player_me.getPathBodyFromCurpath(curpath_for_extended);
  player_me.overwritePath(new_extended, index_of_extended);

  //shift following paths
  var working_curpath = curpath_for_extended;
  var new_tm = to;

  for(var i = index_of_extended+1; i<player_me.paths.length; i++){

    console.log("shifting[" + i + "]" );
    console.log(player_me.paths.length-i-1 + " left");

    var tm_lenght; // we get tm of following path as lenght
    if(i+1 == player_me.paths.length){
      tm_lenght = player_me.curpath.tm + lag_vector;
    }
    else{
      var tm_lenght = player_me.paths[i+1].body.tm + lag_vector;
    }

    var path_body = player_me.paths[i].body;
    player_me.setInitPositionForCurpath(path_body.dir, new_tm, working_curpath, path_body.id );
    player_me.recomputeCurpath(tm_lenght, working_curpath );
    var new_shortended = player_me.getPathBodyFromCurpath(working_curpath);
    player_me.overwritePath(new_shortended, i);

    new_tm = tm_lenght;

  }

  //shift actual curpath
  player_me.setInitPositionForCurpath(player_me.curpath.dir, new_tm, working_curpath, player_me.curpath.id );
  player_me.recomputeCurpath(Date.now(), working_curpath);
  player_me.assignCurpath(player_me.curpath, working_curpath);

  console.log("LAG REDUCTION");
  console.log("________________________________");

}

Player.prototype.assignCurpath = function(lvalue, rvalue){

  lvalue.dir = rvalue.dir;
  lvalue.tm = rvalue.tm;
  lvalue.id = rvalue.id;
  lvalue.angle = rvalue.angle;
  lvalue.base_start_angle = rvalue.base_start_angle;
  lvalue.start.x = rvalue.start.x;
  lvalue.start.y = rvalue.start.y;
  lvalue.end.x = rvalue.end.x;
  lvalue.end.y = rvalue.end.y;
  lvalue.arc_point.x = rvalue.arc_point.x;
  lvalue.arc_point.y = rvalue.arc_point.y;

}

var random = require("random-js")();



module.exports = Player;
