
<template>

  <div class="userpanel" style="position: relative">
    <div style="display: inline-block; width: 15%">
      Hello <span class="username">{{username}}</span>
    </div>
    <div style="display: inline-block; width: 25%">
      <div style="display: inline-block; min-width: 165px">
        Balance: <span class="username">{{tweened_balance}} Satoshi</span>
      </div>
      <transition v-on:enter="enter_difference">
        <span v-if="difference" v-bind:class="{reduced: difference<0, incremented: difference>0}">
          <span v-if="difference>0">+{{difference}}</span>
          <span v-else>{{difference}}</span>
        </span>
      </transition>
    </div>
    <div style="display: inline-block" v-if="!active_faucet_list">
      <button id="btn_faucet_list" v-on:click="switchGameFaucetList" >Faucet List</button>
    </div>
    <div style="display: inline-block" v-else>
      <button id="btn_faucet_list" v-on:click="switchGameFaucetList">Game List</button>
    </div>
    <div style="text-align: right; display: inline-block; width: 35%;" >
      <a v-on:click.prevent="logout" class="href" id="logout" href=""> Logout >> </a>
    </div>
  </div>

</template>

<script>

  module.exports = {

    props: ["username", "balance"],
    data: ()=>({

      tweened_balance: undefined,
      difference: undefined,
      active_faucet_list: false

    }),
    methods: {

      switchGameFaucetList: function(){

        if(!this.active_faucet_list){
          this.$emit("go_to_faucetlist", true);
        }
        else{
          this.$emit("go_to_faucetlist", false); // back to game list
        }

        this.active_faucet_list = !this.active_faucet_list;

      },

      logout: function(){

        this.$axios.get("/login/logout")
        .then( ()=>{
          this.$emit("logout");
        } )

      },
      enter_difference: function(el, done){
        this.$anime({
          targets: el,
          complete: done,
          translateX: "30px",
          duration: 3500,
        })
      }

    },
    mounted: function(){

      this.tweened_balance = this.balance;

    },

    watch: {
      balance: function(new_balance, old_balance ){

        this.$anime({
          targets: this,
          tweened_balance: [old_balance, new_balance],
          round: 1,
          duration: 3500,
          easing: "easeOutQuint"
        });

        this.difference = new_balance - old_balance;

        setTimeout( ()=>{
          this.difference = 0
        }, 3500 );

      }

    }

  }

</script>

<style scoped>

#btn_faucet_list {
  border: 2px solid #efdf24;
  background-color: #446088;
  color: #efdf24;
  padding: 6px 28px;
  letter-spacing: 5px;
  word-spacing: 8px;
  font-size: 14px;
  font-weight: 400;
  position: absolute;
  top: 4px;
  text-align: center;
  min-width: 192px;
  cursor: pointer;
}

#btn_faucet_list:hover {
  background-color: #2e4669;
}

#btn_faucet_list:active {
  padding-top: 7px;
  padding-bottom: 5px;
}

#btn_faucet_list:focus {
  outline: none;
}

.userpanel{
  background-color: #446088;
  padding: 8px;
  color: #efdf24;

}

.username {
  font-weight: 900;
}

#logout{
  color: #efdf24;
}

.reduced {
  display: inline-block;
  color: red;
}

.incremented {
  display: inline-block;
  color: lime;
}


</style>
