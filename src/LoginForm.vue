
<template>
  <div class="form-box">

    <p v-if="msg!=null" class="form-msg-err">
      {{msg}}
    </p>

    <div class="form-input">
      <input placeholder="Username" type="text" v-model="username" />
    </div>
    <div class="form-input">
      <input placeholder="Password" type="password" v-model="password" />
    </div>
    <div class="form-input">
      <checkbox v-model="rememberMe">
          Remember me
      </checkbox>
    </div>
    <button v-on:click="login"><b>LOGIN</b></button>
  </div>
</template>

<script>

  var axios = require("axios");

  module.exports = {

    data: () => ({

      username: "",
      password: "",
      rememberMe: true,
      msg: null

    }),

    methods: {

      login: function(){

        axios.post("http://localhost:3004/login", {
          username: this.username,
          password: this.password,
          rememberMe: this.rememberMe
        }, {
          validateStatus: function (status) {
            return (status >= 200 && status < 300) || status == 401;
          }
        })
        .then( (response)=>{

          if(response.status == 401){
            this.success = false;
            this.msg = "Invalid username or password";
          }

          if(response.data.success == true){
            this.$emit("successfull-login", this.username);
          }

        })


      }

    }


  }

</script>

<style scoped src="./Form.css">

</style>
