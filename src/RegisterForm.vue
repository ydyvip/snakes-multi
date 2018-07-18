


<template>
  <div class="form-box">

    <p v-if="success==true" class="form-msg-valid">
      {{msg}}
    </p>

    <div class="form-input">
      <input class="input" placeholder="Username" type="text" v-model="username.val" />
      <div class="form-input-err" v-if="username.err">{{username.err}}</div>
    </div>
    <div class="form-input">
      <input class="input" placeholder="Password" type="password" v-model="password.val" />
      <div class="form-input-err" v-if="password.err">{{password.err}}</div>
    </div>
    <div class="form-input">
      <input class="input" placeholder="e-mail" type="text" v-model="email.val" />
      <div class="form-input-err" v-if="email.err">{{email.err}}</div>
    </div>
    <div class="form-input">
      <input class="input" placeholder="BTC address" type="text" v-model="btc_address.val" />
      <div class="form-input-err" v-if="btc_address.err">{{btc_address.err}}</div>
    </div>
    <button class="btn green" v-on:click="register">REGISTER</button>
  </div>

</template>

<script>

  module.exports = {

    data: () => ({

      username: {
        val: "",
        err: null
      },
      password: {
        val: "",
        err: null
      },
      email: {
        val: "",
        err: null
      },
      btc_address: {
        val: "",
        err: null
      },

      success: null,
      msg: "Thank you for your registration! Your account is now ready to use."

    }),

    methods: {

      register: function(){

        //reset errors

        this.success = null;

        this.username.err = null;
        this.password.err = null;
        this.email.err = null;
        this.btc_address.err = null;

        this.$axios.post("/register", {
          username: this.username.val,
          password: this.password.val,
          email: this.email.val,
          btc_address: this.btc_address.val
        })
        .then( (response)=> {
          if(!response.data.success){
            response.data.errs.forEach( (err)=> {
              this[err.for].err = err.msg;
            });

          }
          else {
            this.success = true;
          }
        } )

      }

    }


  }

</script>

<style scoped src="./css/Form.css"/>

</style>
