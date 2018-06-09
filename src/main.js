var Vue = require('vue');
var App = require('./App.vue')

import CheckboxRadio from 'vue-checkbox-radio';

Vue.use(CheckboxRadio);

var io = require("socket.io-client")();

Vue.prototype.$io = io;

var app = new Vue({
  el: '#app',
  render: h => h(App)
})
