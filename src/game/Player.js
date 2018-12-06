

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
  this.default_speed = 90;
  this.dir = "straight";
  this.weight = 10;
  this.r = 50;
  this.paths = [];
  this.breakout = true;
  this.show_dir_indicator = true;

  this.path_cnt = 0;

  this.renderBuff = {};

  this.curpath = {
    start: {
      x: initial_state.pos.x,
      y: initial_state.pos.y
    },
    end: {
      x: initial_state.pos.x,
      y: initial_state.pos.y
    },
    arc_point: {
      x: 0,
      y: 0,
      starting_angle: 0
    }
  };

  this.color = initial_state.color;
  this.angle = initial_state.angle

}

Player.prototype.draw = function(self){

  this.ctx.strokeStyle = this.color;
  this.ctx.fillStyle = this.color;


  if(this.restart){
    this.path_cnt = 0;
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

  this.ctx.beginPath();
  this.ctx.arc(this.curpath.end.x, this.curpath.end.y, this.weight/2, 0, 2*Math.PI);
  this.ctx.fill();

  if(this.dir == "straight"){
    this.ctx.beginPath();
    this.ctx.moveTo(this.curpath.start.x, this.curpath.start.y);
    this.ctx.lineTo(this.curpath.end.x, this.curpath.end.y);
    this.ctx.stroke();
  }

  var starting_angle;

  if(this.dir == "left"){

    if(this.breakout)
      starting_angle = this.angle + 90;
    else
      starting_angle = this.starting_angle

    this.ctx.beginPath();
    this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(starting_angle), getRad( this.angle + 90), true);
    this.ctx.stroke();
  }

  if(this.dir == "right"){

    if(this.breakout)
      starting_angle = this.angle - 90;
    else
      starting_angle = this.starting_angle

    this.ctx.beginPath();
    this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(starting_angle), getRad( this.angle - 90));
    this.ctx.stroke();
  }

}

Player.prototype.savePath = function(path_state, serv_or_path_id) {

  if(!path_state || !path_state.body)
    return;

  var path = {};

  var server_active = false;
  var path_id;

  if(serv_or_path_id=="serv"){
    server_active = true;
  }
  else{
    path_id = serv_or_path_id;
  }


  if(!server_active){

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


  if(Number.isInteger(path_id) && path_id<this.paths.length){
    this.paths[path_id] = path;
  }
  else{
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

Player.prototype.applyChangeDir = function(){

  this.dir = this.renderBuff.dir;

  this.curpath.start.x = this.renderBuff.start_x;
  this.curpath.start.y = this.renderBuff.start_y;

  this.curpath.arc_point.x = this.renderBuff.arc_point_x;
  this.curpath.arc_point.y = this.renderBuff.arc_point_y;
  this.starting_angle = this.renderBuff.starting_angle;

  this.renderBuff.dir = undefined;

}

Player.prototype.changeDir = function(new_dir, tm){

  var path = {};

  path.state = null;
  path.body = {};
  path.body.timestamp = new Date().getTime();
  path.body.weight = this.weight;
  path.body.color = this.color;

  this.curpath.tm_creation = tm;

  if(this.dir == "straight" && !this.breakout){

    path.body.type = "line";
    path.body.vertices = this.getVerticesFromLinePath();

    path.body.line = [ [this.curpath.start.x, this.curpath.start.y], [this.curpath.end.x, this.curpath.end.y] ];

    this.curpath.start.x = this.curpath.end.x;
    this.curpath.start.y = this.curpath.end.y;

  }

  // Path definition for collision detection
  if((this.dir == "left" || this.dir == "right") && !this.breakout){

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

  if(new_dir == "straight"){

    this.renderBuff.start_x = this.curpath.end.x;
    this.renderBuff.start_y = this.curpath.end.y;

  }

  if(new_dir == "left"){

    this.renderBuff.start_x = this.curpath.end.x;
    this.renderBuff.start_y = this.curpath.end.y;

    this.renderBuff.arc_point_x = this.curpath.end.x + Math.cos(getRad(this.angle-90)) * this.r;
    this.renderBuff.arc_point_y  = this.curpath.end.y + Math.sin(getRad(this.angle-90)) * this.r;
    this.renderBuff.starting_angle = this.angle + 90;

  }

  if(new_dir == "right"){

    this.renderBuff.start_x = this.curpath.end.x;
    this.renderBuff.start_y = this.curpath.end.y;

    this.renderBuff.arc_point_x = this.curpath.end.x + Math.cos(getRad(this.angle+90)) * this.r;
    this.renderBuff.arc_point_y = this.curpath.end.y + Math.sin(getRad(this.angle+90)) * this.r;
    this.renderBuff.starting_angle = this.angle - 90;

    }

  this.renderBuff.dir = new_dir;

  if(this.breakout){
    return null
  }
  else{
    path.body.id = this.path_cnt++;
    return path;
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

  if(this.breakout){
    this.curpath.start.x = this.curpath.end.x;
    this.curpath.start.y = this.curpath.end.y;
  }

}


Player.prototype.goStraight = function(delta){

  this.curpath.end.x += Math.cos(getRad(this.angle)) * this.speed * delta;
  this.curpath.end.y += Math.sin(getRad(this.angle)) * this.speed * delta;

},

Player.prototype.goLeft = function(delta){

  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed * delta;

  this.angle-=degree_speed;
  if(this.breakout)
    this.starting_angle = this.angle + 90;

  this.curpath.end.x = this.curpath.arc_point.x + Math.cos( getRad(this.angle+90) ) * this.r;
  this.curpath.end.y = this.curpath.arc_point.y + Math.sin( getRad(this.angle+90) ) * this.r;

},

Player.prototype.goRight = function(delta){

  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed * delta;

  this.angle+=degree_speed;
  if(this.breakout)
    this.starting_angle = this.angle - 90;

  this.curpath.end.x = this.curpath.arc_point.x + Math.cos( getRad(this.angle-90) ) * this.r;
  this.curpath.end.y = this.curpath.arc_point.y + Math.sin( getRad(this.angle-90) ) * this.r;

}

Player.prototype.setupPos = function(pos){

  this.curpath.start.x = pos.pos.x;
  this.curpath.start.y = pos.pos.y;
  this.curpath.end.x = pos.pos.x;
  this.curpath.end.y = pos.pos.y;
  this.angle = pos.angle;
  this.dir = "straight";
}

var random = require("random-js")();



module.exports = Player;
