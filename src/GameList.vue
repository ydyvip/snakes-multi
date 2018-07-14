<template>

  <div class="game-box">

    <transition mode="out-in" v-on:enter="enterRoomCreationForm" v-on:leave="leaveRoomCreationForm">
      <div v-if="menu_active" class="game-list-menu" key="m_a1" >
        <a  v-on:click.prevent="menu_active = false" class="href" href=""><b>New >></b></a>
      </div>

      <div v-else class="game-list-menu" key="m_a2">
        <input class="input" type="text" placeholder="Game name" v-model="new_game_form.gamename.val"
          v-tooltip.bottom.notrigger="{
            content: new_game_form.gamename.err_msg,
            class: 'tooltip-custom',
            visible: new_game_form.gamename.err
          }"
        />
        <input class="input" type="text" placeholder="Bet (Satoshi)" v-model="new_game_form.bet.val"
          v-tooltip.bottom.notrigger="{
            content: new_game_form.bet.err_msg,
            class: 'tooltip-custom',
            visible: new_game_form.bet.err
          }"
         />
        <button class="btn" v-on:click="roomCreation" v-tooltip.left.notrigger="{ content: new_game_form.confirm.err_msg, class:'tooltip-custom', visible: new_game_form.confirm.err}" style="margin-right: 20px; background-color: #00afec"><b>CONFIRM</b></button>
        <button class="btn" v-on:click="menu_active = true" style="background-color: #b22222"><b>NEVERMIND</b></button>
      </div>
    </transition>

    <div v-for="game in games" class="room" v-bind:class="{ current_room: currentRoom == game.name }">

      <img v-bind:title="game.players.join()" v-for="n in game.cnt_players" src="img/circle-24-on.svg" /><img v-for="n in 6-game.cnt_players" src="img/circle-24-off.svg" />
      <span class="game-name">{{game.name}}</span>
      <span class="bet">{{game.bet}} Satoshi</span>
      <button class="btn green" v-if="currentRoom != game.name" v-on:click="joinToGame( game.name )" style="margin-left: 50px;"><b>JOIN</b></button>
      <button v-else class="btn red" v-on:click="leaveRoom" style="margin-left: 50px;"><b>LEAVE</b></button>
    </div>

  </div>

</template>

<script>

  module.exports = {

    data: ()=>({

      games: [],
      currentRoom: null,
      menu_active: true,
      new_game_form: {
        confirm: {
          err: false,
          err_msg: null,
          err_timeout: null,
        },
        gamename: {
          val: null,
          err: false,
          err_msg: null,
          err_timeout: null
        },
        bet: {
          val: null,
          err: false,
          err_msg: null,
          err_timeout: null
        }
      }

    }),

    created: function(){

      this.refreshGameList();

      this.$io.on("updategamelist", (games)=>{

        this.games = games;

      })

      this.$io.on("roomchanged", this.updateGamelist );

      this.$io.on("gamestart", this.gameStart);


    },

    props: ["loggedAs"],

    methods: {

      enterRoomCreationForm: function(el, done){
        this.$anime({
          targets: el,
          opacity: [0,1],
          duration: 200,
          easing: "linear",
          complete: done
        })
      },

      leaveRoomCreationForm: function(el, done){
        this.$anime({
          targets: el,
          opacity: [1,0],
          duration: 200,
          easing: "linear",
          complete: done
        })
      },

      gameStart: function(initial_states, first_to_reach){

        this.currentRoom = "";

        this.$emit("gamestart", initial_states, first_to_reach);

      },

      refreshGameList: function(){

        this.$io.emit("getgamelist");

      },

      updateGamelist: function(player, previousroom, nextroom){

        // update previous game
        this.games.findIndex( (game)=>{

          if(game.name == previousroom){

            // remove player from list
            var index = game.players.findIndex((player_item)=>{

              if(player_item == player){
                game.cnt_players--;
                return true;
              }

            });
            game.players.splice(index, 1);
            return true;
          }

        })

        // update new game
        this.games.findIndex( (game)=>{

          if(game.name == nextroom){
            game.cnt_players++;
            game.players.push(player);
            return true;
          }

        })

        return false;

      },

      getRoomWithName: function(gamename){

        var room = this.games.find( function(game){

          if(game.name == gamename)
            return true;

        });

        return room;

      },

      joinToGame: function( gamename ) {

        var room = this.getRoomWithName(gamename);
        if(!room || room.cnt_players>=6){
          return; // TODO: room is full
        }

        this.updateGamelist(this.loggedAs, this.currentRoom, gamename);
        this.currentRoom = gamename;

        this.$io.emit("join", this.loggedAs, gamename);

      },

      roomCreation: function(){

        this.new_game_form.confirm.err = false;
        this.new_game_form.confirm.err_msg = "";
        this.new_game_form.gamename.err = false;
        this.new_game_form.gamename.err_msg = "";
        this.new_game_form.bet.err = false;
        this.new_game_form.bet.err_msg = "";

        if(this.currentRoom){

          clearTimeout(this.new_game_form.confirm.err_timeout);

          this.new_game_form.confirm.err_msg = "Please leave current room before creating another one";
          this.new_game_form.confirm.err = true;

          this.new_game_form.confirm.err_timeout = setTimeout(()=>{
            this.new_game_form.confirm.err = false;
          }, 3000)

        }

        var room_name = this.new_game_form.gamename.val;

        this.$io.emit("newgame", this.new_game_form.gamename.val, this.new_game_form.bet.val, this.loggedAs,
          (res)=>{

            if(res.for == "confirm"){

              clearTimeout(this.new_game_form.confirm.err_timeout);

              this.new_game_form.confirm.err_msg = res.err_msg;
              this.new_game_form.confirm.err = true;

              this.new_game_form.confirm.err_timeout = setTimeout(()=>{
                this.new_game_form.confirm.err = false;
              }, 3000)

            }

            if(res.for == "gamename"){

              clearTimeout(this.new_game_form.gamename.err_timeout);

              this.new_game_form.gamename.err_msg = res.err_msg;
              this.new_game_form.gamename.err = true;

              this.new_game_form.gamename.err_timeout = setTimeout(()=>{
                this.new_game_form.gamename.err = false;
              }, 3000)

            }

            if(res.for == "bet"){

              clearTimeout(this.new_game_form.bet.err_timeout);

              this.new_game_form.bet.err_msg = res.err_msg;
              this.new_game_form.bet.err = true;

              this.new_game_form.bet.err_timeout = setTimeout(()=>{
                this.new_game_form.bet.err = false;
              }, 3000)

            }

            if(res.success == true){
              this.currentRoom = room_name;
            }

          });


      },

      leaveRoom: function(){

        this.$io.emit("leave", this.loggedAs)
        this.updateGamelist(this.loggedAs, this.currentRoom, null);
        this.currentRoom = "";
      }

    }
  }

</script>

<style>
.vue-tooltip.tooltip-custom {
    border: 1px solid white;
    background-color: #b22222;
    text-align: center;
    color: #ffd4be;
}

.vue-tooltip.tooltip-custom .tooltip-arrow {
    border-left-color: white !important;
}
</style>

<style scoped>


.game-list-menu {
  background-color: #3e5382;
  padding: 6px;
  border-bottom: 1px solid black;
  box-shadow: 0px 10px 36px -13px rgba(0,0,0,0.75);
  margin-bottom: 8px;
}

.room {
  padding: 5px 20px;
}

.current_room {
  background-color: #31659a;
}



.bet {
  color: #efdf24;
  font-family: 'Titillium Web', sans-serif;
}

.game-name {
  display: inline-block;
  width: 150px;
  margin-right: 20px;
  margin-left: 20px;
  color: white;
  font-size: 20px;
  font-family: 'Titillium Web', sans-serif;
}

.game-box {
  width: 800px;
  height: 800px;
  margin: 30px auto;
  background-color: #314f79;
  border: 1px solid black;
}

img {
  width: 18px;
  height: 18px;
  margin-right: 5px;
  position: relative;
  top: 3px;
}

</style>

<style>
.vue-tooltip{
   background-color:#000;
   box-sizing:border-box;
   color:#fff;
   max-width:320px;
   padding:6px 10px;
   border-radius:3px;
   z-index:100;
   box-shadow:2px 2px 3px rgba(0,0,0,0.4)
}
.vue-tooltip .vue-tooltip-content{
   text-align:center
}
.vue-tooltip .tooltip-arrow{
   content:'';
   width:0;
   height:0;
   border-style:solid;
   position:absolute;
   margin:5px
}
.vue-tooltip[x-placement^="top"]{
   margin-bottom:5px
}
.vue-tooltip[x-placement^="top"] .tooltip-arrow{
   border-width:5px 5px 0 5px;
   border-top-color:#000;
   border-bottom-color:transparent !important;
   border-left-color:transparent !important;
   border-right-color:transparent !important;
   bottom:-5px;
   margin-top:0;
   margin-bottom:0
}
.vue-tooltip[x-placement^="bottom"]{
   margin-top:5px
}
.vue-tooltip[x-placement^="bottom"] .tooltip-arrow{
   border-width:0 5px 5px 5px;
   border-bottom-color:white;
   border-top-color:transparent !important;
   border-left-color:transparent !important;
   border-right-color:transparent !important;
   top:-5px;
   margin-top:0;
   margin-bottom:0
}
.vue-tooltip[x-placement^="right"]{
   margin-left:5px
}
.vue-tooltip[x-placement^="right"] .tooltip-arrow{
   border-width:5px 5px 5px 0;
   border-right-color:#000;
   border-top-color:transparent !important;
   border-left-color:transparent !important;
   border-bottom-color:transparent !important;
   left:-5px;
   margin-left:0;
   margin-right:0
}
.vue-tooltip[x-placement^="left"]{
   margin-right:5px
}
.vue-tooltip[x-placement^="left"] .tooltip-arrow{
   border-width:5px 0 5px 5px;
   border-left-color:#000;
   border-top-color:transparent !important;
   border-right-color:transparent !important;
   border-bottom-color:transparent !important;
   right:-5px;
   margin-left:0;
   margin-right:0
}

</style>
