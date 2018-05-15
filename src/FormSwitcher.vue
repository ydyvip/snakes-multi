
<template>

  <div>

    <div class="switcher-box">
      <a class="switcher" v-bind:class="{ active: activeTabComp == tab.comp}" v-for="tab in tabs" v-on:click="activeTabComp = tab.comp">
        {{tab.text}}
      </a>
    </div>

    <component v-on:successfull-login="$emit('successfull-login', $event)" v-bind:is="activeTabComp"></component>

  </div>
</template>

<script>
  var LoginForm = require("./LoginForm.vue");
  var RegisterForm = require("./RegisterForm.vue");

  var tabs = [
    {
      comp: LoginForm,
      text: "LOGIN"
    },
    {
      comp: RegisterForm,
      text: "REGISTER"
    }
  ]

  module.exports = {
    data: () => ({
      tabs: tabs,
      activeTabComp: tabs[0].comp
    }),
    components: {
      LoginForm,
      RegisterForm
    }
  }


</script>

<style scoped>

/* TODO: Change cursor on hover */

.switcher {
  display: inline-block;
  margin-right: 20px;
  color: white;
  font-size: 20px;
  font-family: 'Titillium Web', sans-serif;
}

.active {
  border-bottom: 2px solid white;
}

.switcher-box {
  margin: 0 auto;
  text-align: center;
  margin-top: 50px;
  margin-bottom: 20px;
}
</style>
