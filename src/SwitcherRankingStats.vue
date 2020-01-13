<template>
  <div>
    <div class="switcher-box">
      <a class="switcher" v-bind:class="{ active: activeTabComp == tab.comp}" v-for="tab in tabs" v-on:click="activeTabComp = tab.comp">
        {{tab.text}}
      </a>
    </div>
    <transition v-on:enter="enterRegLogForm" v-on:leave="leaveRegLogForm" mode="out-in">
      <component v-bind:is="activeTabComp"></component>
    </transition>
  </div>
</template>

<script>

  var Stats = require("./Stats.vue");
  var Ranking = require("./Ranking.vue");

  var tabs = [
    {
      comp: Ranking,
      text: "RANKING"
    },
    {
      comp: Stats,
      text: "STATS"
    }
  ]

  module.exports = {
    data: () => ({
      tabs: tabs,
      activeTabComp: tabs[0].comp
    }),
    components: {
      Stats,
      Ranking
    },
    methods: {
      enterRegLogForm: function(el, done){
        this.$anime({
          targets: el,
          opacity: [0,1],
          duration: 200,
          easing: "linear",
          complete: done
        })
      },
      leaveRegLogForm: function(el, done){
        this.$anime({
          targets: el,
          opacity: [1,0],
          duration: 200,
          easing: "linear",
          complete: done
        })
      }
    }
  }

</script>

<style scoped>

.switcher {
  display: inline-block;
  margin-right: 20px;
  color: white;
  font-size: 18px;
  font-family: 'Titillium Web', sans-serif;
  cursor: pointer;
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
