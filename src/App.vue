<template>

  <div>

    <form-switcher  v-if="!loggedAs" v-on:successfull-login="(username, balance)=>{ this.loggedAs=username, this.balance=balance}"/>

    <template v-if="loggedAs">
      <user-panel v-bind:username="loggedAs" v-bind:balance="balance" v-on:logout="logout" />
      <component v-bind:initial-states="initial_states" v-bind:first_to_reach="first_to_reach" v-bind:is="GameList_Game" v-bind:loggedAs="loggedAs"
        v-on:gamestart="gamestart" v-on:eog="eog">
      </component>
    </template>

  </div>

</template>

<script>

  var FormSwitcher = require("./FormSwitcher.vue");
  var UserPanel = require("./UserPanel.vue");
  var Game = require("./Game.vue");
  var GameList = require("./GameList.vue");

  module.exports = {
    name: 'app',
    data: () => ({
      // loggedAs: new String("a" + Math.random()*10).substr(0,6), // TODO:  on debug loggedAs, default to null,
      loggedAs: null,
      balance: null,
      GameList_Game: GameList,
      initial_states: null,
      first_to_reach: null
    }),
    mounted:  function(){

      this.$axios.get("/login/session")
      .then( (response)=>{

        this.loggedAs = response.data.username;
        this.balance = response.data.balance;

      })

      this.$bus.$on("balance_update", (amount)=>{

        this.balance = this.balance + amount;

      })

    },
    methods: {
      gamestart: function(initial_states, first_to_reach){
        this.GameList_Game = Game;
        this.initial_states = initial_states;
        this.first_to_reach = first_to_reach;
      },
      eog: function(){
        this.initial_states = null;
        this.GameList_Game = GameList;
      },
      logout: function(){
        this.loggedAs = null;
        setTimeout(()=>{ // hack: calling immediately after comp creation does'n update data on child comp
          this.$bus.$emit("logout");
      },500)
      }
    },
    components: {
      FormSwitcher, UserPanel, Game, GameList
    }
  }
</script>

<style scoped>

  @import url('https://fonts.googleapis.com/css?family=Titillium+Web');
  @import url('https://fonts.googleapis.com/css?family=Abel');

  * {
    font-family: 'Titillium Web', sans-serif;
  }

</style>

<style src="./css/btn.css"/>
<style src="./css/input.css"/>
<style src="./css/href.css"/>

<style>


 body {
   background-color: #284165;
   margin: 0;
 }


</style>
