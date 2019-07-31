
<template>

  <div style="width: 1250px; margin: 0 auto; position: relative;">

  <transition v-on:enter="enter_countdown_active" v-on:leave="leave_countdown_active">
    <div class="countdown" v-if="countdown_active">New round will start in {{countdown_counter}} seconds</div>
  </transition>
  <transition v-on:enter="eog_enter" v-on:leave="eog_leave">
    <div class="eog_box" v-bind:style="{'border-color': winner_color, color: winner_color}" v-if="winner">
      <span v-bind:style="{color: winner_color}">
        {{winner}}
      </span>
      <span style="color: white;">
        wins {{satoshi_reward}} satoshi
      </span><br/>
      <button v-on:click="eog" class="btn-back">Return to game list</button>
    </div>
  </transition>
  <canvas id="canvas" v-bind:style="{'border-color': may_color}" style="border: 1px solid; margin: 10px 5px;" width="800px" height="800px">
  </canvas>

  <player-table v-bind:player_table="player_table" v-bind:first_to_reach="first_to_reach" v-bind:may_color="may_color" ref="pt"/>

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



  function setupAuthorativeServer(io, gamestate){

    //TODO: Legacy path_id, patch when reneabling breakdowns
    io.on("breakdown", (playername, done_path, path_id)=>{

      for( let player_item of players){
        if( player_item.name == playername){

          player_item.changeDir(player_item.curpath.dir);
          player_item.savePath(done_path, path_id);

          player_item.breakout = true;

          setTimeout( ()=>{
            player_item.breakout = false;

          }, 250 );

        }
      }

    })


    io.on("dirchanged", (playername, newdir, tm, state_of_curpath, done_path)=>{

      for( let player_item of players){
        if( player_item.name == playername){

          if(player_item.name!=player_me.name){

            // @TODO ... gamestate.player_consideration == false na biezaca date
            // handle input triggered before qc, when qc is already active
            if(gamestate.player_consideration == false && tm<gamestate.tm_quit_consideration){

              //apply first path before qc

              player_item.clearFurtherPaths(gamestate.tm_quit_consideration, true);
              player_item.applyStartPoitOfCurpathState(player_item.path_before_qc);

              player_item.inputs.push({
                type: "input",
                dir: newdir,
                tm: tm,
                done_path: done_path,
                discard_save: true
              });
              player_item.inputs.push({
                type: "quit_consideration"
              })

            }
            else {
              player_item.inputs.push({
                type: "input",
                dir: newdir,
                tm: tm,
                state_of_curpath: state_of_curpath
              })
            }

          }
          else{

            // TODO: reconciling to remove
            player_item.inputs.push({
              type: "reconciling",
              dir: newdir,
              tm: tm,
              done_path: done_path
            })
         }
        }
      }

    })

    io.on("reduction", (reduction_queue)=>{

      for(var reduction_item of reduction_queue){

        player_me.inputs.push({
          type: "reduction",
          from: reduction_item.input_tm,
          to: reduction_item.tm_to,
          id: reduction_item.id
        });

      }
    });


  };

  function setupKeyboard(io){

    var left = new Keyboard("ArrowLeft");
    var right = new Keyboard("ArrowRight");

    left.press = function(){
      if(player_me.speed==0){
        return;
      }

      var tm = Date.now();
      player_me.inputs.push({
        type: "input",
        dir: "left",
        tm: tm
      })
      io.emit("left", tm);
    }

    left.release = function(){
      if(player_me.curpath.dir != "straight"){
        if(player_me.speed==0){
          return;
        }
       var tm = Date.now();
       player_me.inputs.push({
         type: "input",
         dir: "straight",
         tm: tm
       })
       io.emit("straight", tm);
      }
    }

    right.press = function(){
      if(player_me.speed==0){
        return;
      }
      var tm = Date.now();
      player_me.inputs.push({
        type: "input",
        dir: "right",
        tm: tm
      })
      io.emit("right", tm);
    }

    right.release = function(){
      if(player_me.curpath.dir != "straight"){
        if(player_me.speed==0){
          return;
        }
       var tm = Date.now();
       player_me.inputs.push({
         type: "input",
         dir: "straight",
         tm: tm
       })
       io.emit("straight", tm);
     }
    }

  }

  module.exports = {

    computed: {
      winner_color: function(){

        if(this.winner){

          var p = this.player_table.find((player)=>{

            if(player.playername == this.winner){
              return true;
            }

          })

          if(p)
            return p.color;
          else {
            return undefined;
          }

        }
        else{
          return undefined;
        }
      }
    },

    methods: {

      eog_enter: function(el, done){

        this.$anime({
          targets: el,
          complete: done,
          opacity: [0,1],
          translateY: "350px"
        });

      },

      eog_leave: function(el, done){

        this.$anime({
          targets: el,
          complete: done,
          opacity: [1,0]
        });

      },

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
      },

      draw: function(){

        if(this.veog)
          return;

        ctx.fillStyle = 'black';

        ctx.fillRect(0, 0, canvas.width, canvas.height);

        players.forEach( (player_item)=>{
          var self = false;
          if(player_item.name == player_me.name){
            self = true;
          }
          player_item.draw(self);
        })

      },

      eog: function(){

        gameloop.clearGameLoop(this.gameloop_id);

        player_me = null;
        this.veog = true;

        for(var p of players){
          p = null;
        }

        players = [];

        this.$emit('eog')

      }

    },

    mounted: function(){

      this.game_state = new GameState();

      canvas = document.getElementById("canvas");

      canvas.addEventListener("mousemove", function(e){

      })

      if(!canvas.getContext){
        return;
      }

      ctx = canvas.getContext("2d");

      setupKeyboard(this.$io);
      setupAuthorativeServer(this.$io, this.game_state);


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
              player.show_dir_indicator = true;
              player.inputs = [];
              player.id_cnt = 0;
              player.curpath.id = 0;
              player.curpath.after_qc = false;
            }

          }

        }

      })

      // round start
        // quit_consideration + 4sec

      this.$io.on("round_start", (tm_round_start)=>{

        for(var player of players){
          player.curpath.tm = tm_round_start;
          this.game_state.player_consideration = true;
          player.breakout = true;
          player.speed = player.default_speed;
          player.show_dir_indicator = false;
        }

        var tm_quit_consideration = tm_round_start + 4000;

        this.game_state.tm_quit_consideration = tm_quit_consideration;

        setTimeout(()=>{

          if(player_me.speed == 0){
            return;
          }

          for(var player_ of players){
            player_.inputs.push({
              type: "quit_consideration"
            });
          }

        }, 4000);

      })

      this.$io.on("killed", (playername, collision_tm, path_at_collision, forced)=>{

        for(var player of players){
          if(player.name ==  playername){

            player.inputs.push({
              type: "killed",
              collision_tm: collision_tm,
              path_at_collision: path_at_collision,
              forced: forced
            });

            return;
          }
        }

      })

      this.$io.on("end_of_game", (winner, reward)=>{

        this.winner = winner;
        this.satoshi_reward = reward;

        player_me.speed = 0;

        if(winner == player_me.name){
          this.$bus.$emit("balance_update", reward)
        }

      })


      this.initialStates.forEach( (initial_state_item)=> {

        var player_item = new Player(initial_state_item);

        window.player = player_item;

        player_item.inputs = [];
        player_item.game_state = this.game_state;

        player_item.ctx = ctx;

        players.push(player_item);


        //Setup player_table data
        this.player_table.push({
          playername: player_item.name,
          points: 0,
          color: player_item.color,
          live: true,
          round_points: 0,
          winner: false,
          tie_break: false
        })

        if(initial_state_item.player_name == this.loggedAs ){
          player_me = player_item;
          this.may_color = player_me.color;
        }

      })

      // Mount gameloop

      this.gameloop_id = gameloop.setGameLoop( (delta)=>{

        if(this.veog){
          return;
        }

        for( var player_item of players){
          //INPUT QUEUE
          while(player_item.inputs.length>0){

            var input = player_item.inputs.shift();

            if(input.type == "reduction"){
              player_item.reduction(input.from, input.to, input.id, player_item);
            }
            else if(input.type == "quit_consideration"){
              player_item.quitConsideation(this.game_state.tm_quit_consideration, false);
            }
            else if(input.type == "killed"){

              player_item.clearFurtherPaths(input.collision_tm, false, input.forced);
              player_item.applyCurpathState(input.path_at_collision);
              player_item.speed = 0;
              player_item.collision_tm = 0;
              player_item.id_cnt = 0;
              if(player_item.name=="user6"){
                console.log("killed from server");
              }
              return;
            }
            else if(input.type == "reconciling"){
              //player_item.savePath(input.done_path, false, true);
            }
            else if(input.type == "input"){

              //handle case when input has tm greater than tm of qc
              //but due to latency of timeot of qc - qc input was pushed to queue later
              if(input.tm>this.game_state.tm_quit_consideration && this.game_state.player_consideration == true){

                setTimeout(()=>{
                  player_item.inputs.unshift(input);
                }, 100);

                continue;

              }


              player_item.recomputeCurpath( input.tm );
              var done_path = player_item.changeDir(input.dir, input.tm);
              if(!input.discard_save){
                player_item.savePath(done_path, false, false);
              }

            }
          }

          if(player_item.speed>0){
            player_item.recomputeCurpath(Date.now());
          }
        }

        this.game_state.detectCollision(players);
        //GameState.curosorPlayerCollision(cursor_circle, player);

        this.draw();


      }, 1000/66); // Gamestate update every 30fps


    },

    props: ["initial-states", "loggedAs", "first_to_reach"],

    components: {
      PlayerTable
    },

    data: ()=>{
      return {
        may_color: null,
        player_table: [],
        countdown_active: false,
        countdown_counter: null,
        winner: null,
        satoshi_reward: 0,

        game_state: null,

        gameloop_id: null,
        veog: false
      }
    }


  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css?family=Jua');

  .btn-back {
    height: 35px;
    padding: 5px 15px;
    outline: none;
    /* border: 3px solid pink; */
    border-radius: 15px;
    font-family: monospace;
    margin-top: 15px;
    margin-bottom: 10px;
  }

  .eog_box {
    font-family: 'Jua', sans-serif;
    font-size: 22px;;
    width: 500px;
    position: absolute;
    left: 150px; /* 800/2 - 500/2 */
    background-color: black;
    /* Center text inside */
    text-align: center;
    vertical-align: middle;
    padding: 30px 0 10px;
    box-sizing: border-box;
    border-width: 4px;
    border-style: solid;
    border-radius: 25px;
    box-shadow: 0px 0px 20px 5px;
  }

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
