<template>

  <div>

    <form-switcher  v-if="!loggedAs && !replayActive" v-on:successfull-login="(username, balance)=>{ this.loggedAs=username, this.balance=balance}"/>


    <switcher-ranking-stats v-if="!loggedAs && !replayActive"/>

    <template v-if="loggedAs">
      <user-panel
        v-bind:username="loggedAs" v-bind:balance="balance"  v-bind:in_game="in_game"
        :dropd_list="comp_list"
        :cur_panel="cur_panel"
        v-on:logout="logout"
        v-on:switch_panel="switchPanel"
        v-on:goToWithdrawalPanel="goToWithdrawalPanel"
      />
      <component v-bind:initial-states="initial_states" v-bind:first_to_reach="first_to_reach" v-bind:is="cur_panel.comp" v-bind:loggedAs="loggedAs"
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
  var SwitcherRankingStats = require("./SwitcherRankingStats.vue")

  module.exports = {
    name: 'app',
    data: () => ({
      loggedAs: null,
      balance: null,
      cur_panel: undefined, // Game ; GameList ; FaucetList
      prev_panel: undefined,
      in_game: false, // block CompSwitcher when user is in game
      initial_states: null,
      first_to_reach: null,
      replayActive: false,
      comp_list: [
        {
          comp: GameList,
          label: "GAME LIST",
          value: "game_list"
        },
        {
          comp: FaucetList,
          label: "TOP-UP BALANCE",
          value: "topup"
        },
        {
          comp: WithdrawalPanel,
          label: "WITHDRAWAL",
          value: "withdrawal"
        },
        {
          label: "REFERRERS",
          value: "referrers"
        }
      ],
    }),

    created: function(){

      this.prev_panel = this.comp_list[0];
      this.cur_panel = this.comp_list[0];

    },

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
        this.in_game = true;
        this.cur_panel = this.comp_list[0];
        this.initial_states = initial_states;
        this.first_to_reach = first_to_reach;
      },
      eog: function(){
        this.in_game = false;
        this.initial_states = null;
        this.cur_panel = this.comp_list[0];
        this.prev_panel = this.comp_list[0];
      },
      logout: function(){
        this.loggedAs = null;
          setTimeout(()=>{ // hack: calling immediately after comp creation does'n update data on child comp
            this.$bus.$emit("logout");
        },500)
      },
      switchPanel: function(panel){

        if(this.in_game){
          return;
        }

        this.prev_panel = this.cur_panel;

        this.cur_panel = panel;

      },
      goToWithdrawalPanel: function() {
        if(this.in_game){
          return;
        }
        this.prev_panel = this.cur_panel;
        this.cur_panel = this.comp_list[2];
      },
      returnToPreviousPanel: function() {
          this.cur_panel = this.prev_panel
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
      FormSwitcher, UserPanel, Game, GameList, FaucetList, GameReplay, WithdrawalPanel, SwitcherRankingStats
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
