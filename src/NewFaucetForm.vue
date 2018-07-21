<template>
  <div>
    <template v-if="success==true">
      <p class="form-msg-valid">
          Thank you for registering your faucet <br/>
          We will approve it within 24 hours after you will transfer funds to your deposit account <br/>
          Minimum amount to transfer is 20 000 Satoshi
      </p>
      <p class="form-msg-valid">
        Bitcoin deposit address for this faucet is: <br/>
        <span style="font-weight: 900">{{response.btc_deposit}}</span>
      </p>
      <p class="form-msg-valid">
        API key: <br/>
        <span style="font-weight: 900">{{response.api_key}}</span>
      </p>

      <p style="margin: 35px 40px; text-align: center; color: white; padding: 25px; border-top: 1px solid #476fa9;  ">
        Manage your faucets and have insight at API for withdraws and balance checking: <br/>
        <a href="" class="href" v-on:click:="go_to_faucetmanager">Faucet Manager >></a>
      </p>

    </template>
    <div  v-else class="form-box">

      <div class="form-input">
        <input class="input" placeholder="Faucet name" type="text" v-model="name.val" />
        <div class="form-input-err" v-if="name.err">{{name.err}}</div>
      </div>
      <div class="form-input">
        <input class="input" placeholder="Website URL (http://)" type="text" v-model="url.val" />
        <div class="form-input-err" v-if="url.err">{{url.err}}</div>
      </div>
      <div class="form-input">
        <input class="input" placeholder="Reward (Satoshi)" type="number" v-model="reward.val" />
        <div class="form-input-err" v-if="reward.err">{{reward.err}}</div>
      </div>
      <div class="form-input">
        <input class="input" placeholder="Timer (minutes)" type="number" v-model="timer.val" />
        <div class="form-input-err" v-if="timer.err">{{timer.err}}</div>
      </div>
      <button class="btn" style="margin-right: 20px; background-color: #00afec" v-on:click="sendForm">CONFIRM</button>
      <button class="btn" v-on:click="$emit('back')" style="background-color: #b22222"><b>NEVERMIND</b></button>
    </div>
  </div>
</template>

<script>

  module.exports = {

    data: ()=>({

      msg: "\n" +
       ".\n" +
       ".\n" +
       "\nBitcoin deposit address for this faucet is:\n",
       msg2: "\n\nAPI key:\n",
      success: null,
      response: {
        api_key: null,
        btc_deposit: null
      },

      name: {
        val: "",
        err: null
      },
      url: {
        val: "",
        err: null
      },
      reward: {
        val: "",
        err: null
      },
      timer: {
        val: "",
        err: null
      },
    }),

    methods: {
      sendForm: function(){

        this.success = null;
        this.name.err = null;
        this.url.err = null;
        this.reward.err = null;
        this.timer.err = null;

        this.$axios.post("/faucet/register", {
          name: this.name.val,
          url: this.url.val,
          reward: this.reward.val,
          timer: this.timer.val
        })
        .then( (response)=>{

          if(!response.data.success){
            response.data.errs.forEach( (err)=> {
              this[err.for].err = err.msg;
            });

          }
          else {
            this.success = true;
            this.response.api_key = response.data.api_key;
            this.response.btc_deposit = response.data.btc_deposit;
          }

        })

      },

      go_to_faucetmanager: function(){

      }

    }

  }

</script>

<style scoped>
  p {
    margin: 9px auto;
  }

  .form-box {
    margin-top: 20px;
  }

</style>
