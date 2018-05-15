var Vue = require('vue');
var App = require('./App.vue');

import CheckboxRadio from 'vue-checkbox-radio';

Vue.use(CheckboxRadio);

new Vue({
  el: '#app',
  render: h => h(App)
})
