
<template>
  <div class="form-box">

    <p v-if="msg!=null" class="form-msg-err">
      {{msg}}
    </p>

    <div class="form-input">
      <input class="input" placeholder="Username" type="text" v-model="username" />
    </div>
    <div class="form-input">
      <input class="input" placeholder="Password" type="password" v-model="password" />
    </div>
    <div class="form-input">
      <checkbox v-model="rememberMe">
          Remember me
      </checkbox>
    </div>
    <button class="btn green" v-on:click="login">LOGIN</button>
  </div>
</template>

<script>

  module.exports = {

    data: () => ({

      username: "",
      password: "",
      rememberMe: true,
      msg: null

    }),

    methods: {

      login: function(){

        this.$axios.post("http://localhost:3004/login", {
          username: this.username,
          password: this.password,
          rememberMe: this.rememberMe
        }, {
          validateStatus: function (status) { // handle 401 status what is not default behaviour
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

<style scoped src="./css/Form.css"/>


</style>
