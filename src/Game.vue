
<template>

  <div>

  <transition v-on:enter="enter_countdown_active" v-on:leave="leave_countdown_active">
    <div class="countdown" v-if="countdown_active">New round will start in {{countdown_counter}} seconds</div>
  </transition>
  <canvas id="canvas"  style="border: 1px solid red; margin: 10px 5px;" width="800px" height="800px">
  </canvas>

  <player-table v-bind:player_table="player_table" ref="pt"/>

  </div>

</template>

<script>


  var ctx = null;
  var canvas = null;
  var players = [];
  var player_me = null;

  var PlayerTable = require("./PlayerTable.vue");

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

  function draw(){

    ctx.fillStyle = 'black';

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    players.forEach( (player_item)=>{
      player_item.draw();
    })




    window.requestAnimationFrame(draw);

  }

  function setupAuthorativeServer(io){

    io.on("reapplycurpath", (curpath, dir, angle)=>{

      player_me.curpath = curpath;
      player_me.dir = dir;
      player_me.angle = angle;

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
      if(player_me.speed==0)
        return;
       io.emit("left");
       var path = player_me.changeDir("left");
       // player_me.savePath(path);
    }
    left.release = function(){
      if(!right.isDown){
        if(player_me.speed==0)
          return;
        io.emit("straight");
       var path = player_me.changeDir("straight");
       // player_me.savePath(path);
      }
    }

    right.press = function(){
      if(player_me.speed==0)
        return;
        io.emit("right");
       var path = player_me.changeDir("right");
       // player_me.savePath(path);
    }
    right.release = function(){
      if(!left.isDown){
        if(player_me.speed==0)
          return;
       io.emit("straight");
       var path = player_me.changeDir("straight");
       // player_me.savePath(path);
     }
    }

  }

  module.exports = {

    methods: {

      enter_countdown_active: function(el, done) {

        this.$anime({
          targets: el,
          translateY: "350px",
          opacity: [0,1],
          complete: done
        })
        .finished.then(()=>{

          return this.$anime({
            targets: this,
            duration: this.countdown_counter * 1000,
            easing: "linear",
            round: true,
            countdown_counter: 0
          }).finished;

        })
        .then( ()=>{

          this.countdown_active = false;

        })
        .then( ()=> {

          for( var player of players){
            player.restart = true;
          }

        })

      },

      leave_countdown_active: function(el, done){
        this.$anime({
          targets: el,
          opacity: [1,0],
          complete: done,
          easing: "linear",
          duration: 1555
        })
      }

    },

    mounted: function(){

      canvas = document.getElementById("canvas");

      canvas.addEventListener("mousemove", function(e){

      })

      if(!canvas.getContext){
        return;
      }

      ctx = canvas.getContext("2d");
      GameState.ctx = ctx;

      setupKeyboard(this.$io);
      setupAuthorativeServer(this.$io);


      window.ctx = ctx;


      this.$io.on("newround_countdown", (countdown_counter, initial_states)=>{

        this.countdown_counter = countdown_counter;
        this.countdown_active = true;

      })

      this.$io.on("new_positions_generated", (positions)=>{

        for(var pos of positions){

          for(var player of players){

            if(player.name == pos.for){
              player.setupPos(pos);
            }

          }

        }

      })

      this.$io.on("round_start", ()=>{

        for(var player of players){
          player.speed = player.default_speed;
        }

      })

      this.$io.on("killed", (playername)=>{

        for(var player of players){
          if(player.name ==  playername)
            player.speed = 0;
        }

      })


      this.initialStates.forEach( (initial_state_item)=> {

        var player_item = new Player(initial_state_item);
        player_item.ctx = ctx;

        players.push(player_item);

        //Setup player_table data
        this.player_table.push({
          playername: player_item.name,
          points: 0,
          color: player_item.color,
          live: true,
          round_points: 0,
          winner: false
        })

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

    },

    props: ["initial-states", "loggedAs"],

    components: {
      PlayerTable
    },

    data: ()=>{
      return {
        player_table: [],
        countdown_active: false,
        countdown_counter: null
      }
    }


  }
</script>

<style scoped>

  .countdown {
    width: 800px;
    height: 50px;
    background-color: white;
    border: 1px solid white;
    position: absolute;
    left: 5px;
    /* Center text inside */
    text-align: center;
    vertical-align: middle;
    line-height: 50px;
  }

</style>
