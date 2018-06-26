var Vue = require('vue');
var App = require('./App.vue')

import CheckboxRadio from 'vue-checkbox-radio';
import anime from 'animejs'



Vue.use(CheckboxRadio);


var io = require("socket.io-client")();

Vue.prototype.$io = io;
Vue.prototype.$anime = anime;


var app = new Vue({
  el: '#app',
  render: h => h(App)
})


window.app = app;
