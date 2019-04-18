

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
  this.dir = "straight";
  this.weight = 10;
  this.r = 18;
  this.paths = [];
  this.breakout = true; // breakout should be used only for rendering purpose, not for determining if path should be saved or not
  this.show_dir_indicator = true;
  this.killed = true;
  this.collision_tm = 0;

  this.curpath = {
    tm: 0,
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
  this.angle = undefined;
  this.base_start_angle = undefined;

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
    this.dir = null;
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
    this.ctx.rotate((this.angle + 90) * Math.PI / 180);
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

  if(this.dir == "straight" && !this.breakout){
    this.ctx.beginPath();
    this.ctx.moveTo(this.curpath.start.x, this.curpath.start.y);
    this.ctx.lineTo(this.curpath.end.x, this.curpath.end.y);
    this.ctx.stroke();
  }

  var starting_angle;

  if(this.dir == "left" && !this.breakout){

    if(this.breakout)
      starting_angle = this.angle + 90;
    else
      starting_angle = this.starting_angle

    this.ctx.beginPath();
    this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(starting_angle), getRad( this.angle + 90), true);
    this.ctx.stroke();
  }

  if(this.dir == "right" && !this.breakout){

    if(this.breakout)
      starting_angle = this.angle - 90;
    else
      starting_angle = this.starting_angle

    this.ctx.beginPath();
    this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(starting_angle), getRad( this.angle - 90));
    this.ctx.stroke();
  }

}

Player.prototype.savePath = function(path_state, server_side, reconciled_path) {

  if(!path_state || !path_state.body)
    return;

  var path = {};

  if(!server_side){

    path = new Path2D();

    if(path_state.body.type == "line"){
      path.moveTo(path_state.body.line[0][0], path_state.body.line[0][1]);
      path.lineTo(path_state.body.line[1][0], path_state.body.line[1][1]);
    }

    if( path_state.body.type == "arc" ){
      path.arc( path_state.body.arc.x, path_state.body.arc.y, path_state.body.arc.r, path_state.body.arc.start, path_state.body.arc.end, path_state.body.arc.counterclockwise);
    }

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
    if(!saved){
      console.log("path not reconciled");
      this.paths.push(path);
    }

  }
  else {
    this.paths.push(path);
  }

}

Player.prototype.getVerticesFromLinePath = function(){

  var vertices = [];

  var left_side_sin = Math.sin( getRad(this.angle-90) ) * this.weight * 0.5;
  var left_side_cos = Math.cos( getRad(this.angle-90) ) * this.weight * 0.5;
  var right_side_sin = Math.sin( getRad(this.angle+90) ) * this.weight * 0.5;
  var right_side_cos = Math.cos( getRad(this.angle+90) ) * this.weight * 0.5;

  vertices.push( [
    this.curpath.start.x + left_side_cos,
    this.curpath.start.y + left_side_sin
  ] );

  vertices.push( [
    this.curpath.end.x + left_side_cos,
    this.curpath.end.y + left_side_sin
  ]);

  vertices.push( [
    this.curpath.end.x + right_side_cos,
    this.curpath.end.y + right_side_sin
  ]);

  vertices.push( [
    this.curpath.start.x + right_side_cos,
    this.curpath.start.y + right_side_sin
  ]);

  return vertices;

}

Player.prototype.changeDir = function(new_dir, tm){

  var path = {};

  if( tm>=this.game_state.tm_quit_consideration )
  {

    path.body = {};
    path.body.timestamp = Date.now();
    path.body.tm = this.curpath.tm;
    path.body.weight = this.weight;
    path.body.color = this.color;

    if(this.dir == "straight"){
      path.body.type = "line";
      path.body.vertices = this.getVerticesFromLinePath();
      path.body.line = [ [this.curpath.start.x, this.curpath.start.y], [this.curpath.end.x, this.curpath.end.y] ];

      // TODO: that stuff is unnecessary
      this.curpath.start.x = this.curpath.end.x;
      this.curpath.start.y = this.curpath.end.y;

    }

    // Path definition for collision detection
    if(this.dir == "left" || this.dir == "right"){

      var angle_90 = 0;
      var counterclockwise = false;

      path.body.type = "arc";

      if(this.dir == "left"){
        counterclockwise = true;
        angle_90 = 90;
      }
      if(this.dir =="right"){
        angle_90 = -90;
      }

      var arc = new Arc(this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(this.starting_angle), getRad(this.angle + angle_90), this.weight, counterclockwise  );
      path.body.arc = arc;

    }
  }

  if(new_dir == "straight"){

    this.curpath.start.x = this.curpath.end.x;
    this.curpath.start.y = this.curpath.end.y;

    this.base_start_angle = this.angle;

    this.dir = "straight";

  }

  if(new_dir == "left"){

    this.curpath.start.x = this.curpath.end.x;
    this.curpath.start.y = this.curpath.end.y;

    this.curpath.arc_point.x= this.curpath.end.x + Math.cos(getRad(this.angle-90)) * this.r;
    this.curpath.arc_point.y  = this.curpath.end.y + Math.sin(getRad(this.angle-90)) * this.r;
    this.starting_angle = this.angle + 90;

    this.base_start_angle = this.angle;

    this.dir = "left";

  }

  if(new_dir == "right"){

    this.curpath.start.x = this.curpath.end.x;
    this.curpath.start.x = this.curpath.end.y;

    this.curpath.arc_point.x = this.curpath.end.x + Math.cos(getRad(this.angle+90)) * this.r;
    this.curpath.arc_point.y = this.curpath.end.y + Math.sin(getRad(this.angle+90)) * this.r;
    this.starting_angle = this.angle -90;

    this.base_start_angle = this.angle;

    this.dir = "right";

  }

  this.curpath.tm = tm;

  if(path.body){
    return path;
  }
  else{
    return null;
  }

}

Player.prototype.go = function(delta) {

  if(this.dir == "straight"){
    this.goStraight(delta);
  }
  if(this.dir == "right"){
    this.goRight(delta);
  }
  if(this.dir == "left"){
    this.goLeft(delta);
  }

  // if(this.breakout){
  //   this.curpath.start.x = this.curpath.end.x;
  //   this.curpath.start.y = this.curpath.end.y;
  // }

}


Player.prototype.goStraight = function(delta){

  this.curpath.end.x += Math.cos(getRad(this.angle)) * this.speed * delta;
  this.curpath.end.y += Math.sin(getRad(this.angle)) * this.speed * delta;

},

Player.prototype.goLeft = function(delta){

  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed * delta;

  this.angle-=degree_speed;
  if(this.breakout){
    this.starting_angle = this.angle + 90;
  }

  this.curpath.end.x = this.curpath.arc_point.x + Math.cos( getRad(this.angle+90) ) * this.r;
  this.curpath.end.y = this.curpath.arc_point.y + Math.sin( getRad(this.angle+90) ) * this.r;

},

Player.prototype.goRight = function(delta){

  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed * delta;

  this.angle+=degree_speed;
  if(this.breakout){
    this.starting_angle = this.angle - 90;
  }

  this.curpath.end.x = this.curpath.arc_point.x + Math.cos( getRad(this.angle-90) ) * this.r;
  this.curpath.end.y = this.curpath.arc_point.y + Math.sin( getRad(this.angle-90) ) * this.r;

}

Player.prototype.setupPos = function(pos){

  this.curpath.start.x = pos.pos.x;
  this.curpath.start.y = pos.pos.y;
  this.curpath.end.x = pos.pos.x;
  this.curpath.end.y = pos.pos.y;
  this.angle = pos.angle;
  this.base_start_angle = pos.angle;
  this.dir = "straight";
}

Player.prototype.recomputeCurpath = function(new_dir_tm){

    this.curpath.end.x = this.curpath.start.x;
    this.curpath.end.y = this.curpath.start.y;
    this.angle = this.base_start_angle;
    if(this.dir == "left")
      this.starting_angle = this.angle + 90;
    if(this.dir == "right")
      this.starting_angle = this.angle - 90;

    // Go by time since curpath was started (on last changeDir) to time when client changed dir
    /*
      curpath start time: this.curpath.tm
      new dir time: new_dir_tm (past time because of lag)
    */

    this.go((new_dir_tm - this.curpath.tm)/1000);

}

Player.prototype.getCurpath = function(){

  var obj = {};

  obj.start_x = this.curpath.start.x;
  obj.start_y = this.curpath.start.y;
  obj.end_x = this.curpath.end.x;
  obj.end_y = this.curpath.end.y;
  obj.angle = this.angle;
  obj.starting_angle = this.starting_angle;
  obj.arc_point_x = this.curpath.arc_point.x;
  obj.arc_point_y = this.curpath.arc_point.y;
  obj.dir = this.dir;
  obj.tm = this.curpath.tm;
  return obj;


}

Player.prototype.applyCurpathState = function(state_of_curpath){

  this.curpath.start.x = state_of_curpath.start_x ;
  this.curpath.start.y = state_of_curpath.start_y  ;
  this.curpath.end.x = state_of_curpath.end_x ;
  this.curpath.end.y = state_of_curpath.end_y  ;
  this.angle = state_of_curpath.angle  ;
  this.starting_angle = state_of_curpath.starting_angle  ;
  this.curpath.arc_point.x = state_of_curpath.arc_point_x  ;
  this.curpath.arc_point.y = state_of_curpath.arc_point_y  ;
  this.dir = state_of_curpath.dir;
  this.curpath.tm = state_of_curpath.tm;

}

Player.prototype.applyStartPoitOfCurpathState = function(state_of_curpath){

  this.curpath.start.x = state_of_curpath.start_x ;
  this.curpath.start.y = state_of_curpath.start_y  ;
  this.curpath.end.x = state_of_curpath.start_x ;
  this.curpath.end.y = state_of_curpath.start_y  ;
  this.angle = state_of_curpath.starting_angle  ;
  this.starting_angle = state_of_curpath.starting_angle  ;
  this.curpath.arc_point.x = state_of_curpath.arc_point_x  ;
  this.curpath.arc_point.y = state_of_curpath.arc_point_y  ;
  this.dir = state_of_curpath.dir;
  this.curpath.tm = state_of_curpath.tm;

}

Player.prototype.getPos = function(){

  var pos = {};

  pos.x = this.curpath.end.x;
  pos.y = this.curpath.end.y;
  pos.angle = this.angle;

  return pos;

}

Player.prototype.quitConsideation = function(tm){

  // Save curpath for case when new input that occured before quit consideration arrive.

  this.recomputeCurpath(tm);

  this.path_before_qc = this.getCurpath();

  this.changeDir(this.dir, tm);

  this.breakout = false;

  this.game_state.player_consideration = false;

}

Player.prototype.clearFurtherPaths = function(tm, include){

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

}

var random = require("random-js")();



module.exports = Player;
