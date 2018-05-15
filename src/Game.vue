
<template>

  <canvas id="canvas"  style="margin: 0 auto;" width="800px" height="800px">
  </canvas>

</template>

<script>


  var ctx = null;
  var canvas = null;

  var Keyboard = require("./game/Keyboard.js");
  var player = require("./game/Player.js");
  var GameState = require("./game/GameState.js");
  var circleArcCollision = require("./game/circle-arc-collision.js");


  var arc = require("./game/arc.js");
  var circle = require("./game/circle.js");

  var cursor_circle = {
    x: 0,
    y: 0,
    r: 10,

    draw: function(){

      ctx.save();
      ctx.fillStyle = "red";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
      ctx.fill();
      ctx.restore();
    }

  }



  var arc1 = new arc(80, 50, 200, Math.PI/2, 0, 10, true);
  var arc2 = new arc(600, 50, 200, Math.PI, Math.PI/2 , 10, true);
  var arc3 = new arc(300, 600, 200, Math.PI*1.5, Math.PI, 10, true);
  var arc4 = new arc(350, 600, 200, Math.PI*2, Math.PI*1.5 , 10, true);



  function draw(){

    ctx.fillStyle = 'white';
    ctx.lineCap = "round";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    player.draw();
    cursor_circle.draw();
    arc1.draw();
    arc2.draw();
    arc3.draw();
    arc4.draw();


/*

    var c1 = circleArcCollision(cursor_circle, arc1);
    if(c1){
      arc1.color = "pink";
    }
    else {
      arc1.color = "blue";
    }

    var c = circleArcCollision(cursor_circle, arc2);
    if(c){
      arc2.color = "pink";
    }
    else {
      arc2.color = "blue";
    }

    var c = circleArcCollision(cursor_circle, arc3);
    if(c){
      arc3.color = "pink";
    }
    else {
      arc3.color = "blue";
    }
    var c = circleArcCollision(cursor_circle, arc4);
    if(c){
      arc4.color = "pink";
    }
    else {
      arc4.color = "blue";
    }
*/
  //  GameState.detectCollision([player]);
    GameState.curosorPlayerCollision(cursor_circle, player);

    window.requestAnimationFrame(draw);


  }

  function getRad(degree){
    var radians = degree * Math.PI/180;
    return radians;
  }

  function setupKeyboard(){

    var left = new Keyboard("ArrowLeft");
    var right = new Keyboard("ArrowRight");

    left.press = function(){
      player.changeDir("left");
    }
    left.release = function(){
      if(!right.isDown)
        player.changeDir("straight");
    }

    right.press = function(){
        player.changeDir("right");
    }
    right.release = function(){
      if(!left.isDown)
        player.changeDir("straight");
    }

  }

  module.exports = {

    mounted: function(){

      // Converts from degrees to radians.
      Math.radians = function(degrees) {
        return degrees * Math.PI / 180;
      };

      // Converts from radians to degrees.
      Math.degrees = function(radians) {
        return radians * 180 / Math.PI;
      };

      canvas = document.getElementById("canvas");

      canvas.addEventListener("mousemove", function(e){

      var rect = canvas.getBoundingClientRect();
      cursor_circle.x = e.clientX - rect.x;
      cursor_circle.y = e.clientY - rect.y;

      })

      if(!canvas.getContext){
        return;
      }

      ctx = canvas.getContext("2d");
      GameState.ctx = ctx;

      setupKeyboard();

      window.ctx = ctx;

      player.ctx = ctx;

      window.requestAnimationFrame(draw);

    }

  }
</script>

<style scoped>

</style>
