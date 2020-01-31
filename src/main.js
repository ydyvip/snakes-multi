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

Vue.prototype.$anime = anime;
Vue.prototype.$axios = axios;
Vue.prototype.$bus = new Vue({});
Vue.prototype.$bus.p_socket_connection = null;

Vue.prototype.$estabilishSocketConnection = function(){

  //synchronize time with server

  var ts = timesync.create({
    server: '/timesync',
    interval: null
  });

  ts.on("change", (offset)=>{

    console.log("new offset: " + offset);

  })

  ts.on("sync", (state)=>{

    if(state!="end")
      return;

    Date.nowPure = Date.now;
    Date.now = ()=>{
        return Math.floor(ts.now());
    }

  })

  ts.sync();

  Vue.prototype.$io = require("socket.io-client")();

  var connection_resolve;
  var connection_reject;

  Vue.prototype.$bus.connection_promise = new Promise((resolve_,reject_)=>{
    connection_resolve = resolve_;
    connection_reject = reject_;
  })



  Vue.prototype.$io.on("connect", ()=>{
    connection_resolve("connected");
  })

  Vue.prototype.$io.on("disconnect", (reason)=>{
    console.log("disconnect");
  })

  Vue.prototype.$io.on("error", (err)=>{
    console.log("s error " + err);
    if(err=="already connected"){
      connection_resolve("already connected");
    }
    if(err=="already in game"){
      connection_resolve("already in game");
    }
  })

}

Vue.prototype.$estabilishSocketConnection();



window.lag = 0;

var app = new Vue({
  el: '#app',
  render: h => h(App)
})




window.app = app;
