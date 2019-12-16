<template>

  <div>

    <form-switcher  v-if="!loggedAs && !replayActive" v-on:successfull-login="(username, balance)=>{ this.loggedAs=username, this.balance=balance}"/>

    <template v-if="loggedAs">
      <user-panel v-bind:username="loggedAs" v-bind:balance="balance" v-on:logout="logout"
        v-on:go_to_faucetlist="gotoFaucetlist"
        v-on:goToWithdrawalPanel="goToWithdrawalPanel"
      />
      <component v-bind:initial-states="initial_states" v-bind:first_to_reach="first_to_reach" v-bind:is="CompSwitcher" v-bind:loggedAs="loggedAs"
        v-on:gamestart="gamestart"
        v-on:eog="eog"
        v-on:returnToPreviousPanel="returnToPreviousPanel"
      >
      </component>
    </template>

    <game-replay v-if="!loggedAs && false" v-on:play_replay="playReplay" ></game-replay>

  </div>

</template>

<script>

  var FormSwitcher = require("./FormSwitcher.vue");
  var UserPanel = require("./UserPanel.vue");
  var Game = require("./Game.vue");
  var GameList = require("./GameList.vue");
  var FaucetList = require("./FaucetList.vue");
  var GameReplay = require("./GameReplay.vue");
  var WithdrawalPanel = require("./WithdrawalPanel.vue");

  module.exports = {
    name: 'app',
    data: () => ({
      loggedAs: null,
      balance: null,
      CompSwitcher: GameList, // Game ; GameList ; FaucetList
      PreviousPanel: GameList,
      initial_states: null,
      first_to_reach: null,
      replayActive: false
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
        this.CompSwitcher = Game;
        this.initial_states = initial_states;
        this.first_to_reach = first_to_reach;
      },
      eog: function(){
        this.initial_states = null;
        this.CompSwitcher = GameList;
      },
      logout: function(){
        this.loggedAs = null;
          setTimeout(()=>{ // hack: calling immediately after comp creation does'n update data on child comp
            this.$bus.$emit("logout");
        },500)
      },
      gotoFaucetlist: function(faucetlist){
        if(faucetlist){
          this.CompSwitcher = FaucetList;
          this.PreviousPanel = FaucetList;
        }
        else{ // back to GameList
          this.CompSwitcher = GameList;
          this.PreviousPanel = GameList;
        }
      },
      goToWithdrawalPanel: function() {
          this.CompSwitcher = WithdrawalPanel;
      },
      returnToPreviousPanel: function() {
          this.CompSwitcher = this.PreviousPanel
      },
      playReplay: function(play){
        if(play){
          this.replayActive = true;
        }
        else{
          this.replayActive = false;
        }
      }
    },
    components: {
      FormSwitcher, UserPanel, Game, GameList, FaucetList, GameReplay, WithdrawalPanel
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
<style src="./css/misc.css"/>
<style src="./css/Form.css"/>

<style>

 body {
   background-color: #284165;
   margin: 0;
 }


</style>
