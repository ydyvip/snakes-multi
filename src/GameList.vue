<template>

  <div class="game-box">

    <div v-for="game in games" class="room" v-bind:class="{ current_room: currentRoom == game.name }">

      <img v-bind:title="game.players.join()" v-for="n in game.cnt_players" src="img/circle-24-on.png" />
      <img v-for="n in 6-game.cnt_players" src="img/circle-24-off.png" />
      <span class="game-name">{{game.name}}</span>
      <span class="bet">{{game.bet}} Satoshi</span>
      <button v-on:click="joinToGame( game.name )"><b>JOIN</b></button>
    </div>

  </div>

</template>

<script>

  module.exports = {

    data: ()=>({

      games: [],
      currentRoom: null

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

      gameStart: function(initial_states){

        this.$emit("gamestart", initial_states);

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

      }

    }




  }

</script>

<style scoped>

.room {
  padding: 5px 0;
}

.current_room {
  background-color: #abc;
}

button {
  color: black;
  width: 100px;
  padding: 4px;
  box-sizing: border-box;
  vertical-align: middle;
  margin-left: 50px;
}

button {
  font-family: 'Titillium Web', sans-serif;
  border-radius: 10px;
  border-color: black;
  background-color: #2ece2e;
  box-sizing: border-box;
}

button:active {
  padding-top: 5px;
  padding-bottom: 3px;
}

button:focus {
  outline: none;
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
  background-color: #5e6672;
}

img {
  width: 18px;
  height: 18px;
  margin-right: 5px;
  position: relative;
  top: 3px;
}

</style>
