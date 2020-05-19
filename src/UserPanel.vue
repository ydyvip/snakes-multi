
<template>
  <div>

    <div class="userpanel">
      <a href="https://discord.gg/qPxRMFt" >
        <img src="img/discord-512.webp" class="discord-button-sm"/>
      </a>
      <div style="flex-grow: 1"></div>
      <div style="display: inline-block; margin-right: 50px;">
        Hello <span class="username">{{username}}</span>
      </div>
      <div style="display: inline-block; margin-right: 50px;">
        <div style="display: inline-block; min-width: 165px">
          Balance: <a v-on:click.prevent="goToWithdrawalPanel" class="href username" id="logout" href=""> {{tweened_balance}} BCH Satoshi  >> </a>
        </div>
        <transition v-on:enter="enter_difference">
          <span v-if="difference" v-bind:class="{reduced: difference<0, incremented: difference>0}">
            <span v-if="difference>0">+{{difference}}</span>
            <span v-else>{{difference}}</span>
          </span>
        </transition>
      </div>

      <dropd
        @item-change="switchPanel"
        :list="dropd_list"
        :value="cur_panel"
      ></dropd>

      <div style="text-align: right; display: inline-block; margin-left: 50px;">
        <a v-on:click.prevent="logout" class="href" id="logout" href=""> Logout >> </a>
      </div>
      <div style="flex-grow: 1"></div>
    </div>
    <div style="display: flex; justify-content: center; margin-top: 30px;">
      <div style="display: inline-block; width: 728px; height: 90px; margin: 0 auto ">
        <ins class="bmadblock-5e134d97cc12ba49d16b8de9" style="display:inline-block;width:728px;height:90px;"></ins>
        <script async type="application/javascript" src="//ad.bitmedia.io/js/adbybm.js/5e134d97cc12ba49d16b8de9"></script>
      </div>
    </div>
  </div>

</template>

<script>

  module.exports = {

    props: ["username", "balance", "in_game", "dropd_list", "cur_panel"],
    data: ()=>({

      tweened_balance: undefined,
      difference: undefined,

    }),
    methods: {

      switchPanel: function(dropd_item){

        if(this.in_game){
          return;
        }

        this.$emit("switch_panel", dropd_item);

      },

      logout: function(){

        this.$axios.get("/login/logout")
        .then( ()=>{
          this.$emit("logout");
          this.$io.close();
        } )

      },
      goToWithdrawalPanel: function(){

        if(this.in_game){
          return;
        }

        this.$emit("goToWithdrawalPanel");

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
<style>

  :focus {outline:none;}
  ::-moz-focus-inner {border:0;}

  .dropd {
    font-family: 'Titillium Web', sans-serif;
    width: 350px;
    font-size: 15px;
    outline: none;
    letter-spacing: 4px;
  }
  button.dropd-toggle {
    font-family: 'Titillium Web', sans-serif;
    width: 350px;
    font-size: 15px;
    outline: none;
    letter-spacing: 4px;
    background-color: #9ec4ff;
    font-weight: 900;
  }
  .dropd-toggle button:focus{
    outline: none;
  }

</style>
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
  top: 4px;
  text-align: center;
  min-width: 192px;
  cursor: pointer;
}

.discord-button-sm {
  width: 48px;
  height: 48px;
  display: block;
  margin-left: 25px;
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
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.username {
  font-weight: 900;
  color: #efdf24;
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
