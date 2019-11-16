var Vue = require('vue');
var App = require('./App.vue')

import CheckboxRadio from 'vue-checkbox-radio';
import anime from 'animejs'
import Tooltip from 'vue-directive-tooltip';
import vSelect from 'vue-select'

Vue.component('v-select', vSelect)

var axios = require("axios");


Vue.use(CheckboxRadio);
Vue.use(Tooltip);


Vue.prototype.$estabilishSocketConnection = function(){

  Vue.prototype.$io = require("socket.io-client")();

}

Vue.prototype.$estabilishSocketConnection();

Vue.prototype.$io.on("connect", ()=>{
  console.log("connect socket");
})

Vue.prototype.$io.on("disconnect", (reason)=>{
  console.log("disconnect socket");
  console.log("reason: " + reason);
})

Vue.prototype.$io.on("error", (err)=>{
  console.log("error: " + err);
})


Vue.prototype.$anime = anime;
Vue.prototype.$axios = axios;
Vue.prototype.$bus = new Vue({});
window.lag = 0;

var app = new Vue({
  el: '#app',
  render: h => h(App)
})




window.app = app;
