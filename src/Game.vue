
<template>

  <canvas id="canvas"  style="margin: 0 auto;" width="800px" height="800px">
  </canvas>

</template>

<script>


  var ctx = null;
  var canvas = null;
  var players = [];
  var player_me = null;

  // required by gameloop to work on clientside
  process.hrtime = require('browser-process-hrtime');
  require("setimmediate");

  const gameloop = require('node-gameloop');

  var Keyboard = require("./game/Keyboard.js");
  var Player = require("./game/Player.js");
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

  function draw(){

    ctx.fillStyle = 'white';

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    players.forEach( (player_item)=>{
      player_item.draw();
    })

    cursor_circle.draw();

    window.requestAnimationFrame(draw);

  }

  function setupAuthorativeServer(io){

    io.on("reapplycurpath", (curpath)=>{

      player_me.curpath= curpath;

    })

    io.on("dirchanged", (playername, newdir, done_path)=>{


      for( let player_item of players){
        if( player_item.name == playername){

          player_item.changeDir(newdir);
          player_item.savePath(done_path);

        }
      }

    })

    io.on("stateupdate", (player_states)=>{

      for( let player_state_item of player_states ){

        for( let player_item of players){

          // if(player_me.name == player_state_item.name){
            // continue;
          // }

          if(player_state_item.name == player_item.name ){

            player_item.curpath.end = player_state_item.curpath_end;
            player_item.angle = player_state_item.angle;


          }

        }

      }

    })


  }

  function setupKeyboard(io){

    var left = new Keyboard("ArrowLeft");
    var right = new Keyboard("ArrowRight");

    left.press = function(){
     io.emit("left");
     var path = player_me.changeDir("left");
     // player_me.savePath(path);
    }
    left.release = function(){
      if(!right.isDown){
        io.emit("straight");
       var path = player_me.changeDir("straight");
       // player_me.savePath(path);
      }
    }

    right.press = function(){
        io.emit("right");
       var path = player_me.changeDir("right");
       // player_me.savePath(path);
    }
    right.release = function(){
      if(!left.isDown){
       io.emit("straight");
       var path = player_me.changeDir("straight");
       // player_me.savePath(path);
     }
    }

  }

  module.exports = {

    props: ["initial-states", "loggedAs"],

    mounted: function(){

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

      setupKeyboard(this.$io);
      setupAuthorativeServer(this.$io);


      window.ctx = ctx;



      this.initialStates.forEach( (initial_state_item)=> {

        var player_item = new Player(initial_state_item);
        player_item.ctx = ctx;

        players.push(player_item);

        if(initial_state_item.player_name == this.loggedAs ){
          player_me = player_item;
        }

      })



      // Mount gameloop

      gameloop.setGameLoop( function(delta){

        players.forEach( (player_item)=>{
          player_item.go(delta);
        })

        GameState.detectCollision(players);
        //GameState.curosorPlayerCollision(cursor_circle, player);

      }, 1000/60); // Gamestate update every 30fps



      window.requestAnimationFrame(draw);

    }

  }
</script>

<style scoped>

</style>
