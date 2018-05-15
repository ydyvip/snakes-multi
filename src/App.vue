<template>

  <div>

    <form-switcher  v-if="!loggedAs" v-on:successfull-login="loggedAs=$event"/>

    <user-panel  v-if="loggedAs" v-bind:username="loggedAs" />
    <game v-if="loggedAs"/>

  </div>

</template>

<script>

  var FormSwitcher = require("./FormSwitcher.vue");
  var UserPanel = require("./UserPanel.vue");
  var Game = require("./Game.vue");

  module.exports = {
    name: 'app',
    data: () => ({
      loggedAs: "kubus" // TODO: debug
    }),
    components: {
      FormSwitcher, UserPanel, Game
    }
  }
</script>

<style>

@import url('https://fonts.googleapis.com/css?family=Titillium+Web');

* {
  font-family: 'Titillium Web', sans-serif;
}

 body {
   background:
   radial-gradient(black 15%, transparent 16%) 0 0,
   radial-gradient(black 15%, transparent 16%) 8px 8px,
   radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 0 1px,
   radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 8px 9px;
   background-color:#282828;
   background-size:16px 16px;
   margin: 0;
 }


</style>
