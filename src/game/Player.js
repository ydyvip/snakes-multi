

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
  speed: 1,
  angle: 45,
  dir: "straight",
  right_angle: 0,
  left_angle: 0,
  color: "black",
  weight: 15,
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


  	for(var i = 0; i<this.paths.length; i++){


      ctx.strokeStyle = this.paths[i].body.color;
      ctx.lineCap="round";
      this.ctx.lineWidth = this.paths[i].body.weight;
  		this.ctx.stroke(this.paths[i]);

      ctx.strokeStyle = "black";

  	}

  	this.go();

  },

  changeDir: function(new_dir){

  	var path = new Path2D();
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



  		path.moveTo(this.curpath.start.x, this.curpath.start.y);
  		path.lineTo(this.curpath.end.x, this.curpath.end.y);

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
      path.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(this.starting_angle), getRad( this.angle + angle_90), counterclockwise);
      path.body.arc = arc;

  	}


  	this.paths.push(path);


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
  },

  go: function(){

    this.ctx.lineWidth = this.weight;

  	if(this.dir == "straight"){
  		this.goStraight();
  	}
  	if(this.dir == "right"){
  		this.goRight();
  	}
  	if(this.dir == "left"){
  		this.goLeft();
  	}

  //  this.ctx.save();
  //  this.ctx.fillStyle="red";
  //  this.ctx.beginPath();
  //  this.ctx.arc(this.curpath.end.x, this.curpath.end.y, 15/2, 0, 2*Math.PI);
  //  this.ctx.fill();
  //  this.ctx.restore();

  },

  goStraight: function(){

	this.curpath.end.x += Math.cos(getRad(this.angle)) * this.speed;
	this.curpath.end.y += Math.sin(getRad(this.angle)) * this.speed;

	this.ctx.beginPath();
	this.ctx.moveTo(this.curpath.start.x, this.curpath.start.y);
	this.ctx.lineTo(this.curpath.end.x, this.curpath.end.y);
	this.ctx.stroke();

  },

  goLeft: function(){

	  this.curpath.end.x = this.curpath.arc_point.x + Math.cos( getRad(this.angle+90) ) * this.r;
	  this.curpath.end.y = this.curpath.arc_point.y + Math.sin( getRad(this.angle+90) ) * this.r;

	  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed;

	  this.angle-=degree_speed;
	  this.ctx.beginPath();
	  this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(this.starting_angle), getRad( this.angle + 90), true);
	  this.ctx.stroke();


  },

  goRight: function(){

	  this.curpath.end.x = this.curpath.arc_point.x + Math.cos( getRad(this.angle-90) ) * this.r;
	  this.curpath.end.y = this.curpath.arc_point.y + Math.sin( getRad(this.angle-90) ) * this.r;

	  var degree_speed = 360 / (2*Math.PI*this.r) * this.speed;

	  this.angle+=degree_speed;

	  this.ctx.beginPath();
	  this.ctx.arc( this.curpath.arc_point.x, this.curpath.arc_point.y, this.r, getRad(this.starting_angle), getRad( this.angle - 90));
	  this.ctx.stroke();


  }

}

module.exports = player;
