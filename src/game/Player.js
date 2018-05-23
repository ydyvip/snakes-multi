

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

function getRad2(degree){
  degree = degree % 360;
  var radians = degree * (Math.PI / 180);
  return radians;
}

var player = {
  name: "kubus",
  speed: 3,
  angle: 45,
  dir: "straight",
  right_angle: 0,
  left_angle: 0,
  color: "black",
  weight: 10,
  r: 50,
  paths: [],
  curpath: {
	  start: {
		  x: 100,
		  y: 400
	  },
	  end: {
		  x: 100,
		  y: 400
	  },
	  arc_point: {
		  x: 0,
		  y: 0,
		  starting_angle: 0
	  }
  },

  draw: function() {

    var ctx = this.ctx;

    // drawing done paths
  	for(var i = 0; i<this.paths.length; i++){

      ctx.strokeStyle = this.paths[i].body.color;
      ctx.lineCap="round";
      this.ctx.lineWidth = this.paths[i].body.weight;
  		this.ctx.stroke(this.paths[i]);

      ctx.strokeStyle = "black";

  	}

    // drawing current path
    this.ctx.lineWidth = this.weight;

    if(this.dir == "straight"){
      this.ctx.beginPath();
      this.ctx.moveTo(this.curpath.start.x, this.curpath.start.y);
      this.ctx.lineTo(this.curpath.end.x, this.curpath.end.y);
      this.ctx.stroke();
  	}

    if(this.dir == "left"){
      this.ctx.beginPath();
  	  this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(this.starting_angle), getRad( this.angle + 90), true);
  	  this.ctx.stroke();
    }

    if(this.dir == "right"){
      this.ctx.beginPath();
  	  this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(this.starting_angle), getRad( this.angle - 90));
  	  this.ctx.stroke();
    }

  },

  savePath: function(path_state){

    var path = new Path2D();

    if(path_state.body.type == "line"){
      path.moveTo(path_state.body.line[0][0], path_state.body.line[0][1]);
  		path.lineTo(path_state.body.line[1][0], path_state.body.line[1][1]);
    }

    if( path_state.body.type == "arc" ){
      path.arc( path_state.body.arc.x, path_state.body.arc.y, path_state.body.arc.r, path_state.body.arc.start, path_state.body.arc.end, path_state.body.arc.counterclockwise);
    }

    path.body = path_state.body;
    this.paths.push(path);

  },

  changeDir: function(new_dir){


  	var path = {};

    path.state = null;
    path.body = {};
    path.body.weight = this.weight;
    path.body.color = path.body.defaultColor = "black";

  	if(this.dir == "straight"){

  		path.body.type = "line";
      path.body.vertices = [];

      var left_side_sin = Math.sin( getRad(this.angle-90) ) * this.weight * 0.5;
      var left_side_cos = Math.cos( getRad(this.angle-90) ) * this.weight * 0.5;
      var right_side_sin = Math.sin( getRad(this.angle+90) ) * this.weight * 0.5;
      var right_side_cos = Math.cos( getRad(this.angle+90) ) * this.weight * 0.5;

      path.body.vertices.push( [
        this.curpath.start.x + left_side_cos,
        this.curpath.start.y + left_side_sin
      ] );

      path.body.vertices.push( [
        this.curpath.end.x + left_side_cos,
        this.curpath.end.y + left_side_sin
      ]);

      path.body.vertices.push( [
        this.curpath.end.x + right_side_cos,
        this.curpath.end.y + right_side_sin
      ]);

      path.body.vertices.push( [
        this.curpath.start.x + right_side_cos,
        this.curpath.start.y + right_side_sin
      ]);

      path.body.line = [ [this.curpath.start.x, this.curpath.start.y], [this.curpath.end.x, this.curpath.end.y] ];

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

  	if(new_dir == "straight"){

  		this.curpath.start.x = this.curpath.end.x;
  		this.curpath.start.y = this.curpath.end.y;

  	}

  	if(new_dir == "left"){

  		this.curpath.arc_point.x = this.curpath.end.x + Math.cos(getRad(this.angle-90)) * this.r;
  		this.curpath.arc_point.y = this.curpath.end.y + Math.sin(getRad(this.angle-90)) * this.r;

  		this.starting_angle = this.angle + 90;

  	}

  	if(new_dir == "right"){

  		this.curpath.arc_point.x = this.curpath.end.x + Math.cos(getRad(this.angle+90)) * this.r;
  		this.curpath.arc_point.y = this.curpath.end.y + Math.sin(getRad(this.angle+90)) * this.r;

  		this.starting_angle = this.angle - 90;

  	}

  	this.dir = new_dir;

    return path;

  },

  go: function(){

  	if(this.dir == "straight"){
  		this.goStraight();
  	}
  	if(this.dir == "right"){
  		this.goRight();
  	}
  	if(this.dir == "left"){
  		this.goLeft();
  	}

  },

  goStraight: function(){

    this.curpath.end.x += Math.cos(getRad(this.angle)) * this.speed;
    this.curpath.end.y += Math.sin(getRad(this.angle)) * this.speed;

  },

  goLeft: function(){

	  this.curpath.end.x = this.curpath.arc_point.x + Math.cos( getRad(this.angle+90) ) * this.r;
	  this.curpath.end.y = this.curpath.arc_point.y + Math.sin( getRad(this.angle+90) ) * this.r;

	  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed;

	  this.angle-=degree_speed;

  },

  goRight: function(){

	  this.curpath.end.x = this.curpath.arc_point.x + Math.cos( getRad(this.angle-90) ) * this.r;
	  this.curpath.end.y = this.curpath.arc_point.y + Math.sin( getRad(this.angle-90) ) * this.r;

	  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed;

	  this.angle+=degree_speed;

  }

}

module.exports = player;
