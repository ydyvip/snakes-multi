
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
      <button v-if="!gamereplay" v-on:click="eog" class="btn-back">Return to game list</button>
      <button v-else v-on:click="eog" class="btn-back">Return to replay list</button>
    </div>
  </transition>
  <div class="canvas-wrapper">
    <canvas id="canvas" v-bind:style="{'border-color': may_color}" style="border: 1px solid; margin: 10px 5px;" width="800px" height="800px">
    </canvas>
    <transition name="slow_connection_warrning">
      <div v-if="slow_connection_warrning" class="slow-connection-box">
        <div>SLOW CONNECTION</div>
        <div>We can not process your actions !</br>
        Your internet is too slow</div>
      </div>
    </transition>
  </div>


  <player-table v-bind:player_table="player_table" v-bind:first_to_reach="first_to_reach" v-bind:max_players="max_players" v-bind:may_color="may_color" ref="pt"/>

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
  var GapController = require("./game/breakdown.js");
  var circleArcCollision = require("./game/circle-arc-collision.js");

  var arc = require("./game/arc.js");
  var circle = require("./game/circle.js");



  function setupAuthorativeServer(io, gamestate, gamereplay){

    io.on("dirchanged", (playername, newdir, tm, state_of_curpath, done_path)=>{

      for( let player_item of players){

          if( (player_item.name == playername && player_item.name!=player_me.name) || gamereplay )
          {
            player_item.inputs.push({
              type: "input",
              dir: newdir,
              tm: tm,
              state_of_curpath: state_of_curpath
            })
          }
      }

    })

    io.on("reduction", (id, new_tm)=>{

        player_me.inputs.push({
          type: "reduction",
          id: id,
          tm_to: new_tm
        });

    });


  };

  function setupKeyboard(io){


    var left = new Keyboard("ArrowLeft");
    var right = new Keyboard("ArrowRight");

    left.press = function(){
      if(player_me.speed==0){
        return;
      }
      player_me.processInput(io, "left");
    }

    left.release = function(){
      if(player_me.curpath.dir != "straight"){
        if(player_me.speed==0){
          return;
        }
        player_me.processInput(io, "straight");
      }
    }

    right.press = function(){
      if(player_me.speed==0){
        return;
      }
      player_me.processInput(io, "right");
    }

    right.release = function(){
      if(player_me.curpath.dir != "straight"){
        if(player_me.speed==0){
          return;
        }
        player_me.processInput(io, "straight");
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
      setupAuthorativeServer(this.$io, this.game_state, this.gamereplay);


      window.ctx = ctx;


      this.$io.on("newround_countdown", (countdown_counter)=>{

        console.log("newround_countdown " + countdown_counter);

        this.countdown_counter = countdown_counter;
        this.countdown_active = true;

        clearTimeout(this.tmout_qc);

        for(var player of players){
          player.speed = 0;
          player.gap_ref.clearTimeouts();
        }

      })

      this.$io.on("new_positions_generated", (positions)=>{

        for(var pos of positions){

          for(var player of players){

            if(player.name == pos.for){
              player.setupPos(pos);
              player.init_pos = pos;
              player.show_dir_indicator = true;
              player.inputs = [];
              player.inputs_history = [];
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
          player.init_pos.tm = tm_round_start;
          this.game_state.player_consideration = true;
          player.breakout = true;
          player.speed = player.default_speed;
          player.show_dir_indicator = false;
        }

        var tm_quit_consideration = tm_round_start + 4000;

        this.game_state.tm_quit_consideration = tm_quit_consideration;
        this.game_state.tm_round_start = tm_round_start;

        this.tmout_qc = setTimeout(()=>{

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

        clearTimeout(this.tmout_qc);

        this.winner = winner;
        this.satoshi_reward = reward;

        for(var player of players){
          player.speed = 0;
          player.gap_ref.clearTimeouts();
        }

        if(winner == player_me.name){
          this.$bus.$emit("balance_update", reward)
        }

        this.gap_controller.demountClientSideHandlers();


      })

      this.$io.on("slow_connection_warrning", ()=>{

          this.slow_connection_warrning = true;

          setTimeout(()=>{
            this.slow_connection_warrning = false;
          }, 1000);

      });


      this.max_players = this.initialStates.length;

      this.initialStates.forEach( (initial_state_item)=> {

        var player_item = new Player(initial_state_item);
        player_item.server_side = false;

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

      this.gap_controller = new GapController(players, false, this.$io);

      // Mount gameloop

      this.gameloop_id = gameloop.setGameLoop( (delta)=>{

        if(this.veog){
          return;
        }

        for( var player_item of players){
          //INPUT QUEUE
          while(player_item.inputs.length>0){

            var input = player_item.inputs.shift();

            if(player.speed == 0)
              continue;

            if(input.type == "gap_start"){
              player_item.gap_ref.startGap();
            }
            else if(input.type == "gap_end"){
              player_item.gap_ref.endGap();
            }
            else if(input.type == "reduction"){
              player_item.reduction2(input.id, input.tm_to);
            }
            else if(input.type == "quit_consideration"){
              player_item.quitConsideation(this.game_state.tm_quit_consideration, false);
            }
            else if(input.type == "killed"){
              player_item.clearFurtherPaths(input.collision_tm, false, input.forced);
              player_item.applyCurpathState(input.path_at_collision);
              player_item.gap_ref.clearTimeouts();
              player_item.speed = 0;
              player_item.collision_tm = 0;
              player_item.id_cnt = 0;
              return;
            }
            else if(input.type == "input"){

              player_item.recomputeCurpath( input.tm );
              var done_path = player_item.changeDir(input.dir, input.tm);
              player_item.savePath(done_path, false);

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

    props: ["initial-states", "loggedAs", "first_to_reach", "gamereplay" ],

    components: {
      PlayerTable
    },

    data: ()=>{
      return {
        may_color: null,
        player_table: [],
        countdown_active: false,
        countdown_counter: null,
        slow_connection_warrning: false,
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

  .slow_connection_warrning-enter-active, .slow_connection_warrning-leave-active{
    transition: opacity 1s;
  }

  .slow_connection_warrning-enter, .slow_connection_warrning-leave-to{
    opacity: 0;
  }

  .canvas-wrapper {
    display: inline-grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  .canvas-wrapper canvas {
    grid-column: 1/2;
    grid-row: 1/2;
  }

  .slow-connection-box {
    grid-column: 1/2;
    grid-row: 1/2;
    justify-self: center;
    align-self: start;
    margin-top: 150px;
    background-color: #f26e6e;
    width: 650px;
    padding: 25px;
    color: white;
  }
  .slow-connection-box div:nth-child(1) {
    text-align: center;
    font-size: 28px;
  }
  .slow-connection-box div:nth-child(2) {
    text-align: center;
    font-size: 22px;
  }
</style>
