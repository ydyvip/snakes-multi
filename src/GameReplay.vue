<template>

  <div>

    <table v-if="!replayActive">
      <tr>
        <th>Name</th><th>Winner</th><th>Reward</th><th></th>
      </tr>
      <tr v-for="replay_item of replaylist">
        <td>{{replay_item.name}}</td>
        <td>{{replay_item.winner}}</td>
        <td>{{replay_item.reward}}</td>
        <td><button v-on:click="playReplay(replay_item._id)">PLAY</button></td>
      </tr>
    </table>

    <game v-if="replayActive" v-bind:initial-states="initial_states" v-bind:first_to_reach="first_to_reach" v-bind:loggedAs="loggedAs" v-bind:gamereplay="true"></game>

  </div>

</template>

<script>

  var Game = require("./Game.vue");

  module.exports = {

    data: ()=>({
      replaylist: [],
      replayActive: false,
      initial_states: [],
      first_to_reach: null,
      loggedAs: null
    }),

    components: {
      Game
    },

    methods: {
      playReplay: function(replay_id){

          this.$io.emit("playreplay", replay_id, (loggedAs)=>{
            this.loggedAs = loggedAs;
          } );

        }
    },

    mounted: function(){

      this.$axios.get("/gamereplays")
      .then((res)=>{

        this.replaylist = res.data;

      })

      this.$io.on("gamestart", (initial_states, first_to_reach)=>{

        this.initial_states = initial_states;
        this.first_to_reach = first_to_reach;
        this.replayActive = true;

      })

    }

  }

</script>

<style scoped>

</style>
