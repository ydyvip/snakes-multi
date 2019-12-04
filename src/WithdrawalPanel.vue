<template>
    <div class="main-box">
      <div class="box">
        Balance total: {{this.balance_total}}
        <div class="balance-info">
          Funds available for game betting <br/>
          Top-up balance via visiting faucets
        </div>
      </div>
      <div class="box">
        Balance withdrawal: {{this.balance_withdrawal}}
        <div class="balance-info">
          Funds available for withdrawal<br/>
          Transfered as a reward for winning matches and rounds
        </div>
      </div>
    </div>
</template>

<script>

  module.exports = {

    data: ()=>({
      balance_total: undefined,
      balance_withdrawal: undefined,
      btc_address: undefined
    }),

    mounted: function(){

      this.$axios.get("/login/session/balance")
      .then( (response)=>{

        this.balance_total = response.data.balance_total;
        this.balance_withdrawal = response.data.balance_withdrawal;
        this.btc_address = response.data.btc_address;

      })

    }

  }


</script>


<style scoped>
  .box {
    font-family: 'Titillium Web', sans-serif;
    color: white;
    border-top: 1px solid #476fa9;
    margin: 35px 40px;
    padding: 15px;
    text-align: center;
    font-size: 20px;
    border-top: 1px solid #476fa9;
  }
  .balance-info {
    font-size: 16px;
    margin-top: 16px;
  }
</style>
