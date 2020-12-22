<template>
    <div class="main-box">

      <a v-on:click.prevent="$emit('returnToPreviousPanel')" class="href username" href="">&lt;&lt;&lt; Return</a>

      <div class="box">
        Balance total: {{this.balance_total}} BCH Satoshi
        <div class="balance-info">
          Funds available for game betting <br/>
          Top-up balance via visiting faucets
        </div>
      </div>
      <div class="box">
        Balance withdrawal: {{this.balance_withdrawal}} BCH Satoshi
        <div class="balance-info">
          Funds available for withdrawal<br/>
          Transfered as a reward for winning matches and rounds
        </div>

        <div class="response-box" v-bind:class="{'response-box-success': withdrawal_result, 'response-box-failure': !withdrawal_result}" v-if="withdrawal_response" >
          {{withdrawal_response}}
        </div>

        <label>Amount (BCH satoshi): </label><input v-model="amount" type="number" class="withdrawal-input" /><br/>
        <label>User ID: </label><input v-model="user_id" type="text" class="withdrawal-input" />
        <br/>
        <div class="withdrawal-button" v-on:click="withdrawToExpressCrypto">
          Withdraw to expresscrypto.io
        </div>

      </div>
    </div>
</template>

<script>

  module.exports = {

    data: ()=>({
      balance_total: undefined,
      balance_withdrawal: undefined,
      amount: 0,
      user_id: "",
      withdrawal_result: null,
      withdrawal_response: null
    }),

    mounted: function(){

      this.$axios.get("/login/session/balance")
      .then( (response)=>{

        this.balance_total = response.data.balance_total;
        this.balance_withdrawal = response.data.balance_withdrawal;

      })

    },

    methods: {

      withdrawToExpressCrypto: function(){

        this.$axios.post("/login/withdraw", {
          where: "expresscrypto",
          amount: this.amount,
          wallet_id: this.user_id
        })
        .then((response)=>{

          if(response.data.success){
            this.withdrawal_result = true;
            this.withdrawal_response = this.amount + " satoshi transfered successfully";
          }
          else{
            this.withdrawal_result = false;
            this.withdrawal_response = response.data.failure_reason;
          }

        })

      }

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
  .username {
    font-weight: 900;
    color: #efdf24;
  }
  .withdrawal-input {
    width: 170px;
    margin-top: 12px;
  }
  .withdrawal-input:nth-of-type(1) {
    margin-top: 50px;
    width: 170px;
  }
  .withdrawal-button {
    border: 1px solid black;
    border-radius: 6px;
    display: inline-block;
    margin-top: 20px;
    padding: 8px 26px;
    font-size: 18px;
    cursor: pointer;
    background-color: chocolate;
  }
  .withdrawal-button:hover {
    background-color: #b55711;
  }
  .response-box{
    width: 75%;
    margin: auto auto;
    margin-top: 50px;
    padding: 10px 0;
  }
  .response-box-success{
    border: 2px solid black;
    background-color: #09bf09;
  }
  .response-box-failure{
    border: 2px solid black;
    background-color: #c81717;
  }

</style>
