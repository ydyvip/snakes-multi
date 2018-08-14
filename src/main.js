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

var io = require("socket.io-client")();

Vue.prototype.$io = io;
Vue.prototype.$anime = anime;
Vue.prototype.$axios = axios;
Vue.prototype.$bus = new Vue({});

var app = new Vue({
  el: '#app',
  render: h => h(App)
})




window.app = app;
