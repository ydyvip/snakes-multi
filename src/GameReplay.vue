<template>

  <div>
    <ul v-if="!replayActive">
      <li v-for="replay_id of replaylist"><a href="" v-on:click="playReplay(replay_id)"> {{replay_id}}</a></li>
    </ul>

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
